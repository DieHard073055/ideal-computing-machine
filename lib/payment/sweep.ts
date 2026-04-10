import { ethers } from 'ethers'
import { decrypt } from '@/lib/crypto'

// ─── EVM ───────────────────────────────────────────────────────────────────

const EVM_CHAIN_CONFIGS: Record<
  string,
  { rpcUrl: string; tokenAddress: string; nativeSymbol: string }
> = {
  base: {
    rpcUrl: process.env.BASE_RPC_URL ?? 'https://sepolia.base.org',
    tokenAddress:
      process.env.BASE_TOKEN_ADDRESS ?? '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    nativeSymbol: 'ETH',
  },
  arbitrum: {
    rpcUrl: process.env.ARBITRUM_RPC_URL ?? 'https://sepolia-rollup.arbitrum.io/rpc',
    tokenAddress:
      process.env.ARBITRUM_TOKEN_ADDRESS ?? '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
    nativeSymbol: 'ETH',
  },
  bnb: {
    rpcUrl: process.env.BSC_RPC_URL ?? 'https://data-seed-prebsc-1-s1.binance.org:8545',
    tokenAddress:
      process.env.BNB_TOKEN_ADDRESS ?? '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
    nativeSymbol: 'BNB',
  },
  polygon: {
    rpcUrl: process.env.POLYGON_RPC_URL ?? 'https://rpc-amoy.polygon.technology',
    tokenAddress:
      process.env.POLYGON_TOKEN_ADDRESS ?? '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
    nativeSymbol: 'MATIC',
  },
}

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
]

export interface SweepResult {
  walletAddress: string
  chain: string
  tokenAmount: number
  txHash: string
  status: 'swept' | 'skipped' | 'error'
  error?: string
}

function isLocalRpc(url: string): boolean {
  return (
    url.includes('localhost') ||
    url.includes('127.0.0.1') ||
    url.includes('anvil') ||
    url.includes('hardhat')
  )
}

/**
 * Sweep ERC-20 tokens from many wallets to a treasury address.
 *
 * Strategy:
 *   1. Check token balance of each wallet.
 *   2. For wallets with balance > 0, estimate the gas needed for an ERC-20
 *      transfer and pre-fund the wallet with that exact amount of native token
 *      from the treasury (gas master) wallet.
 *   3. Execute the ERC-20 transfer from each wallet to the treasury.
 *
 * The treasury wallet must hold native tokens (ETH/BNB/MATIC) on each chain
 * to cover gas top-ups.
 */
export async function sweepEVM(
  chain: string,
  wallets: { address: string; encryptedKey: string }[],
  treasuryAddress: string,
  treasuryPrivateKey: string
): Promise<SweepResult[]> {
  const config = EVM_CHAIN_CONFIGS[chain]
  if (!config) throw new Error(`Unknown EVM chain: ${chain}`)

  const provider = new ethers.JsonRpcProvider(config.rpcUrl)
  const treasuryWallet = new ethers.Wallet(treasuryPrivateKey, provider)
  const tokenContract = new ethers.Contract(config.tokenAddress, ERC20_ABI, provider)
  const local = isLocalRpc(config.rpcUrl)

  // ── Phase 1: check all balances in parallel ──────────────────────────────
  const GAS_LIMIT = BigInt(100000)
  const feeData = await provider.getFeeData()
  const effectiveGasPrice =
    feeData.maxFeePerGas ??
    feeData.gasPrice ??
    ethers.parseUnits(local ? '2' : '20', 'gwei')
  const gasCost = (GAS_LIMIT * effectiveGasPrice * BigInt(150)) / BigInt(100)

  const checks = await Promise.all(
    wallets.map(async ({ address, encryptedKey }) => {
      const [balance, nativeBalance] = await Promise.all([
        tokenContract.balanceOf(address) as Promise<bigint>,
        provider.getBalance(address),
      ])
      return { address, encryptedKey, balance, nativeBalance }
    })
  )

  const toSweep = checks.filter((c) => c.balance > BigInt(0))
  const toSkip  = checks.filter((c) => c.balance === BigInt(0))

  const results: SweepResult[] = toSkip.map((c) => ({
    walletAddress: c.address, chain, tokenAmount: 0, txHash: '', status: 'skipped',
  }))

  if (toSweep.length === 0) return results

  // ── Phase 2: batch-prefund all wallets that need gas (parallel, seq nonces) ──
  const needsFunding = toSweep.filter((c) => c.nativeBalance < gasCost)
  if (needsFunding.length > 0) {
    let nonce = await provider.getTransactionCount(treasuryWallet.address, 'latest')
    const fundTxs = await Promise.all(
      needsFunding.map(({ address, nativeBalance }) => {
        const topUp = gasCost - nativeBalance
        return treasuryWallet.sendTransaction({ to: address, value: topUp, nonce: nonce++ })
      })
    )
    // Wait for the last funding TX — all previous ones will also be confirmed by then
    await fundTxs[fundTxs.length - 1].wait()
  }

  // ── Phase 3: all token transfers in parallel ──────────────────────────────
  // Each user wallet has its own nonce space, so transfers are fully independent.
  const transferResults = await Promise.allSettled(
    toSweep.map(async ({ address, encryptedKey, balance }) => {
      const privateKey = decrypt(encryptedKey)
      const userWallet = new ethers.Wallet(privateKey, provider)
      const connectedToken = new ethers.Contract(config.tokenAddress, ERC20_ABI, userWallet)
      const tx = await connectedToken.transfer(treasuryAddress, balance, { gasLimit: GAS_LIMIT })
      const receipt = await tx.wait()
      return {
        walletAddress: address,
        chain,
        tokenAmount: Number(ethers.formatUnits(balance, 6)),
        txHash: receipt.hash as string,
        status: 'swept' as const,
      }
    })
  )

  for (const result of transferResults) {
    if (result.status === 'fulfilled') {
      results.push(result.value)
    } else {
      const addr = toSweep[transferResults.indexOf(result)]?.address ?? '?'
      results.push({
        walletAddress: addr,
        chain,
        tokenAmount: 0,
        txHash: '',
        status: 'error',
        error: result.reason instanceof Error ? result.reason.message : String(result.reason),
      })
    }
  }

  return results
}

