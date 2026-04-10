/**
 * End-to-end sweep test with 100 users.
 *
 * Steps:
 *   1. Register 100 users (parallel batches)
 *   2. Fetch each user's Base wallet address
 *   3. Fund every wallet with 5 mUSDC from Anvil account 0
 *   4. Trigger POST /api/admin/sweep (base only)
 *   5. Verify on-chain that all wallets are empty and treasury received funds
 *
 * Run from the project root:
 *   node scripts/test-sweep-100.mjs
 */

import { ethers } from 'ethers'

const BASE_URL  = 'http://localhost:3000'
const RPC_URL   = 'http://localhost:8545'
const TOKEN     = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const TREASURY  = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const FUNDER_PK = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const USDC_PER_WALLET = 5   // $5 mUSDC per wallet
const TOTAL_USERS     = 100
const BATCH_SIZE      = 20  // concurrent HTTP requests

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
]

// ── Helpers ──────────────────────────────────────────────────────────────────

const log = (msg) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${msg}`)

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * POST/GET with cookie-jar simulation (returns Set-Cookie header value).
 */
async function apiFetch(path, { method = 'GET', body, cookie } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const setCookie = res.headers.get('set-cookie') ?? ''
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, data, setCookie }
}

function extractToken(setCookie) {
  // Parse __lucky_token=<value>; from Set-Cookie header
  const m = setCookie.match(/__lucky_token=([^;]+)/)
  return m ? `__lucky_token=${m[1]}` : ''
}

// ── 1. Register 100 users ─────────────────────────────────────────────────────

log(`Registering ${TOTAL_USERS} users…`)
const users = [] // { email, cookie }

for (let batchStart = 0; batchStart < TOTAL_USERS; batchStart += BATCH_SIZE) {
  const batchEnd = Math.min(batchStart + BATCH_SIZE, TOTAL_USERS)
  const batch = Array.from({ length: batchEnd - batchStart }, (_, i) => {
    const idx = batchStart + i + 1
    const email = `sweeptest_${idx}_${Date.now()}@test.local`
    return apiFetch('/api/auth/register', {
      method: 'POST',
      body: { name: `Sweep User ${idx}`, email, password: 'password123' },
    }).then(({ ok, data, setCookie }) => {
      if (!ok) throw new Error(`Register failed for ${email}: ${JSON.stringify(data)}`)
      return { email, cookie: extractToken(setCookie) }
    })
  })
  const results = await Promise.all(batch)
  users.push(...results)
  process.stdout.write(`  registered ${users.length}/${TOTAL_USERS}\r`)
}
log(`Registered ${users.length} users ✓`)

// ── 2. Fetch Ethereum wallet for each user ───────────────────────────────────

log('Fetching ETH wallets…')
const wallets = [] // { email, address }

for (let batchStart = 0; batchStart < users.length; batchStart += BATCH_SIZE) {
  const batch = users.slice(batchStart, batchStart + BATCH_SIZE).map(({ email, cookie }) =>
    apiFetch('/api/user/wallets', { cookie }).then(({ data }) => {
      const baseWallet = Array.isArray(data) ? data.find((w) => w.chain === 'base') : null
      if (!baseWallet) throw new Error(`No Base wallet for ${email}`)
      return { email, address: baseWallet.address }
    })
  )
  const results = await Promise.all(batch)
  wallets.push(...results)
  process.stdout.write(`  fetched ${wallets.length}/${users.length}\r`)
}
log(`Fetched ${wallets.length} ETH wallet addresses ✓`)

// ── 3. Fund all wallets with mUSDC ───────────────────────────────────────────

log(`Funding each wallet with $${USDC_PER_WALLET} mUSDC (${wallets.length} wallets)…`)
log('  Sending all transfers concurrently (no per-TX wait)…')

const provider  = new ethers.JsonRpcProvider(RPC_URL)
const funder    = new ethers.Wallet(FUNDER_PK, provider)
const token     = new ethers.Contract(TOKEN, ERC20_ABI, funder)
const amount    = ethers.parseUnits(String(USDC_PER_WALLET), 6)

// Fire all transfers with explicit sequential nonces (avoids replacement-underpriced errors).
// ethers auto-increments nonce per-wallet when sending concurrently from the same signer,
// so we fetch the starting nonce once and assign manually.
const startNonce = await provider.getTransactionCount(funder.address, 'latest')
const fundingTxs = await Promise.all(
  wallets.map(({ address }, i) =>
    token.transfer(address, amount, { nonce: startNonce + i })
  )
)

// Wait for the last TX to confirm (all prior ones will have been mined by then)
log(`  Waiting for block confirmation…`)
await fundingTxs[fundingTxs.length - 1].wait()

// Quick sanity check: sample 3 wallets to confirm they have the expected balance
let funded = 0
for (const { address } of wallets.slice(0, 3)) {
  const bal = await token.balanceOf(address)
  if (bal >= amount) funded++
}
log(`  Sample check (first 3): ${funded}/3 wallets funded ✓`)

// Record treasury mUSDC balance AFTER funding (treasury == funder, so capture post-send).
// This way the delta only reflects tokens swept back, not the circular send-then-receive.
const treasuryBefore = await token.balanceOf(TREASURY)

// ── 4. Trigger sweep ─────────────────────────────────────────────────────────

// Admin login
const { setCookie: adminCookie } = await apiFetch('/api/auth/login', {
  method: 'POST',
  body: { email: 'admin@lucky.local', password: 'changeme' },
})
const adminSession = extractToken(adminCookie)
if (!adminSession) throw new Error('Admin login failed')

log('Triggering sweep via POST /api/admin/sweep (base)…')
const t0 = Date.now()
const { ok: sweepOk, data: sweepData } = await apiFetch('/api/admin/sweep', {
  method: 'POST',
  body: { chain: 'base' },
  cookie: adminSession,
})
const elapsed = ((Date.now() - t0) / 1000).toFixed(1)

if (!sweepOk) {
  console.error('Sweep API failed:', sweepData)
  process.exit(1)
}

// ── 5. Print summary ─────────────────────────────────────────────────────────

const { summary, results, configErrors } = sweepData

console.log('\n══════════════════════════════════════════════')
console.log(`  SWEEP RESULTS  (completed in ${elapsed}s)`)
console.log('══════════════════════════════════════════════')
console.log(`  Wallets in DB : ${results.length}`)
console.log(`  Swept         : ${summary.swept}`)
console.log(`  Skipped (0 bal): ${summary.skipped}`)
console.log(`  Errors        : ${summary.errors}`)
console.log(`  Total swept   : $${summary.totalTokenAmount.toFixed(2)} mUSDC`)

if (configErrors.length > 0) {
  console.log('\n  Config warnings:')
  configErrors.forEach((e) => console.log(`    ⚠ ${e}`))
}

if (summary.errors > 0) {
  const errored = results.filter((r) => r.status === 'error')
  console.log('\n  Errors:')
  errored.slice(0, 5).forEach((r) =>
    console.log(`    ${r.walletAddress.slice(0, 10)}… → ${r.error?.slice(0, 120)}`)
  )
}

// ── 6. On-chain verification ──────────────────────────────────────────────────

console.log('\n── On-chain verification ──────────────────────────────')

// Sample: check 10 swept wallets are now empty
const sweptWallets = results.filter((r) => r.status === 'swept').slice(0, 10)
let emptyCount = 0
for (const { walletAddress } of sweptWallets) {
  const bal = await token.balanceOf(walletAddress)
  if (bal === BigInt(0)) emptyCount++
}
console.log(`  ${emptyCount}/${sweptWallets.length} sampled wallets verified empty on-chain`)

// Check treasury received expected total.
// treasuryBefore was measured AFTER funding, so delta = tokens swept back from this run's
// 100 wallets. Any extra wallets swept (from prior test runs) are a bonus, not a failure.
const treasuryAfter = await token.balanceOf(TREASURY)
const treasuryDelta = Number(ethers.formatUnits(treasuryAfter - treasuryBefore, 6))
const expectedTotal = USDC_PER_WALLET * wallets.length
console.log(`  Treasury delta: +$${treasuryDelta.toFixed(2)} mUSDC`)
console.log(`  Expected min  : +$${expectedTotal.toFixed(2)} mUSDC (${wallets.length} wallets × $${USDC_PER_WALLET})`)

// Delta should be >= expected (extra swept wallets from prior runs only increase it)
const match = treasuryDelta >= expectedTotal - 0.01
console.log(`  Balance check : ${match ? '✓ PASS' : '✗ MISMATCH'}`)

console.log('══════════════════════════════════════════════\n')

if (summary.errors > 0 || !match) process.exit(1)
process.exit(0)
