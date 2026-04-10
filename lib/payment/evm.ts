import { ethers } from 'ethers'

// Contract address env vars allow docker-compose to point all three EVM chains
// at the local Anvil mock token (0x5FbDB2...) without changing source code.
const CHAIN_CONFIGS: Record<string, { rpcUrl: string; tokenAddress: string }> = {
  base: {
    rpcUrl: process.env.BASE_RPC_URL ?? 'https://sepolia.base.org',
    tokenAddress:
      process.env.BASE_TOKEN_ADDRESS ?? '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  },
  arbitrum: {
    rpcUrl: process.env.ARBITRUM_RPC_URL ?? 'https://sepolia-rollup.arbitrum.io/rpc',
    tokenAddress:
      process.env.ARBITRUM_TOKEN_ADDRESS ?? '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
  },
}

const ERC20_TRANSFER_ABI = [
  'event Transfer(address indexed from, address indexed to, uint256 value)',
]

export interface TransferResult {
  to: string
  txHash: string
  amount: number
}

function isLocalRpc(url: string): boolean {
  return (
    url.includes('localhost') ||
    url.includes('127.0.0.1') ||
    url.includes('anvil') ||
    url.includes('hardhat') ||
    url.includes('ganache')
  )
}

export async function checkEVMPayments(
  chain: string,
  addresses: string[],
  fromBlock: number
): Promise<TransferResult[]> {
  const config = CHAIN_CONFIGS[chain]
  if (!config) throw new Error(`Unknown EVM chain: ${chain}`)

  const provider = new ethers.JsonRpcProvider(config.rpcUrl)
  const contract = new ethers.Contract(config.tokenAddress, ERC20_TRANSFER_ABI, provider)

  const latestBlock = await provider.getBlockNumber()

  // On local chains scan from genesis — the chain is short-lived and fast.
  // On public testnets limit to the last 1 000 blocks to stay within RPC limits.
  const startBlock =
    fromBlock > 0
      ? fromBlock
      : isLocalRpc(config.rpcUrl)
        ? 0
        : Math.max(0, latestBlock - 1000)

  const addressSet = new Set(addresses.map((a) => a.toLowerCase()))

  const filter = contract.filters.Transfer(null, null)
  const logs = await contract.queryFilter(filter, startBlock, latestBlock)

  const results: TransferResult[] = []

  for (const log of logs) {
    const parsed = contract.interface.parseLog({ topics: log.topics as string[], data: log.data })
    if (!parsed) continue

    const toAddress = (parsed.args[1] as string).toLowerCase()
    if (addressSet.has(toAddress)) {
      const amount = Number(ethers.formatUnits(parsed.args[2], 6))
      results.push({
        to: parsed.args[1] as string,
        txHash: log.transactionHash,
        amount,
      })
    }
  }

  return results
}
