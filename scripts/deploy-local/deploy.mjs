/**
 * Deploy MockToken (mUSDC) to the local Anvil chain and mint
 * 1 000 000 tokens to every pre-funded Anvil account.
 *
 * Runs inside the `deployer` docker-compose service (node:20-alpine).
 * Uses ethers v6 + solc npm package — no external tooling required.
 */

import { ethers } from 'ethers'
import { createRequire } from 'module'
import { readFileSync } from 'fs'

const require = createRequire(import.meta.url)
const solc    = require('solc')

const RPC_URL    = process.env.RPC_URL    ?? 'http://anvil:8545'
const PRIVATE_KEY = process.env.PRIVATE_KEY ?? '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const CONTRACT_SRC = process.env.CONTRACT_SRC ?? '/contracts/MockToken.sol'

// ── 1. Compile ────────────────────────────────────────────────────────────────
console.log('\n━━━ Compiling MockToken.sol ━━━')

const source = readFileSync(CONTRACT_SRC, 'utf8')

const solcInput = {
  language: 'Solidity',
  sources: { 'MockToken.sol': { content: source } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } },
  },
}

const output = JSON.parse(solc.compile(JSON.stringify(solcInput)))

if (output.errors?.some((e) => e.severity === 'error')) {
  console.error('Compilation errors:', output.errors)
  process.exit(1)
}

const compiled  = output.contracts['MockToken.sol']['MockToken']
const abi       = compiled.abi
const bytecode  = compiled.evm.bytecode.object

console.log('Compilation successful.')

// ── 2. Deploy (idempotent) ────────────────────────────────────────────────────
console.log('\n━━━ Deploying to Anvil ━━━')

const provider = new ethers.JsonRpcProvider(RPC_URL)
const wallet   = new ethers.Wallet(PRIVATE_KEY, provider)

// Compute the expected CREATE address from deployer nonce=0 so we can check
// if the token was already deployed on a previous container start.
const EXPECTED = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

const existingCode = await provider.getCode(EXPECTED)
let address

if (existingCode && existingCode !== '0x') {
  // Contract already deployed — skip deployment and minting.
  address = EXPECTED
  console.log(`MockToken already deployed at: ${address} (skipping deploy + mint)`)
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  MockToken (mUSDC)  : ${address}  (already deployed)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
  process.exit(0)
}

const factory  = new ethers.ContractFactory(abi, bytecode, wallet)
const token = await factory.deploy('Mock USDC', 'mUSDC')
await token.waitForDeployment()

address = await token.getAddress()
console.log(`MockToken (mUSDC) deployed at: ${address}`)

if (address.toLowerCase() !== EXPECTED.toLowerCase()) {
  console.warn(`WARNING: address ${address} !== expected ${EXPECTED}`)
  console.warn('Update ETHEREUM_TOKEN_ADDRESS / BNB_TOKEN_ADDRESS / POLYGON_TOKEN_ADDRESS in docker-compose.yml')
}

// ── 3. Mint to every Anvil default account ────────────────────────────────────
console.log('\n━━━ Minting 1 000 000 mUSDC to each Anvil account ━━━')

const ANVIL_ACCOUNTS = [
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
  '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
  '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
  '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
  '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
  '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
  '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
]

const AMOUNT = ethers.parseUnits('1000000', 6) // 1M tokens (6 decimals)

const tokenContract = new ethers.Contract(address, abi, wallet)

for (const account of ANVIL_ACCOUNTS) {
  const tx = await tokenContract.mint(account, AMOUNT)
  await tx.wait()
  console.log(`  → ${account}  +1 000 000 mUSDC`)
}

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  MockToken (mUSDC)  : ${address}
  All 10 Anvil accounts funded with 1 000 000 mUSDC
  Use ./scripts/local/fund-address.sh to top up any address
  Use ./scripts/local/simulate-payment.sh to test a payment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
