/**
 * End-to-end test for the change-password feature.
 *
 * Steps:
 *   1. Register a new user
 *   2. Change their password via POST /api/user/password
 *   3. Verify old password no longer works
 *   4. Verify new password works
 *   5. Verify wrong current password is rejected
 *   6. Verify short password is rejected
 *
 * Run from project root:
 *   node scripts/test-change-password.mjs
 */

const BASE_URL = 'http://localhost:3000'

const log  = (msg) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${msg}`)
const pass = (msg) => console.log(`  ✓ ${msg}`)
const fail = (msg) => { console.error(`  ✗ ${msg}`); process.exit(1) }

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
  const m = setCookie.match(/__lucky_token=([^;]+)/)
  return m ? `__lucky_token=${m[1]}` : ''
}

// ── 1. Register ───────────────────────────────────────────────────────────────

log('Registering test user…')
const email = `pwtest_${Date.now()}@test.local`
const originalPassword = 'original_password_123'
const newPassword = 'new_secure_password_456'

const { ok: regOk, setCookie: regCookie } = await apiFetch('/api/auth/register', {
  method: 'POST',
  body: { name: 'PW Test User', email, password: originalPassword },
})
if (!regOk) fail('Registration failed')
const cookie = extractToken(regCookie)
if (!cookie) fail('No session cookie after registration')
pass('Registered and logged in')

// ── 2. Reject wrong current password ─────────────────────────────────────────

log('Testing rejection of wrong current password…')
const { ok: wrongOk, data: wrongData } = await apiFetch('/api/user/password', {
  method: 'POST',
  body: { currentPassword: 'definitely_wrong', newPassword },
  cookie,
})
if (wrongOk) fail('Should have rejected wrong current password')
if (!wrongData.error?.toLowerCase().includes('incorrect')) fail(`Wrong error message: ${wrongData.error}`)
pass('Wrong current password correctly rejected')

// ── 3. Reject short new password ──────────────────────────────────────────────

log('Testing rejection of short new password…')
const { ok: shortOk } = await apiFetch('/api/user/password', {
  method: 'POST',
  body: { currentPassword: originalPassword, newPassword: 'short' },
  cookie,
})
if (shortOk) fail('Should have rejected short password')
pass('Short password correctly rejected')

// ── 4. Reject unauthenticated request ─────────────────────────────────────────

log('Testing rejection of unauthenticated request…')
const { ok: unauthOk, status: unauthStatus } = await apiFetch('/api/user/password', {
  method: 'POST',
  body: { currentPassword: originalPassword, newPassword },
})
if (unauthOk || unauthStatus !== 401) fail('Should have returned 401 for unauthenticated request')
pass('Unauthenticated request correctly rejected (401)')

// ── 5. Change password ────────────────────────────────────────────────────────

log('Changing password…')
const { ok: changeOk, data: changeData } = await apiFetch('/api/user/password', {
  method: 'POST',
  body: { currentPassword: originalPassword, newPassword },
  cookie,
})
if (!changeOk) fail(`Password change failed: ${changeData.error}`)
pass('Password changed successfully')

// ── 6. Old password no longer works ──────────────────────────────────────────

log('Verifying old password no longer works…')
const { ok: oldLoginOk } = await apiFetch('/api/auth/login', {
  method: 'POST',
  body: { email, password: originalPassword },
})
if (oldLoginOk) fail('Old password should no longer be accepted')
pass('Old password correctly rejected')

// ── 7. New password works ─────────────────────────────────────────────────────

log('Verifying new password works…')
const { ok: newLoginOk, setCookie: newCookie } = await apiFetch('/api/auth/login', {
  method: 'POST',
  body: { email, password: newPassword },
})
if (!newLoginOk) fail('New password should be accepted')
if (!extractToken(newCookie)) fail('No session cookie with new password login')
pass('New password accepted — login successful')

// ── Summary ───────────────────────────────────────────────────────────────────

console.log('\n══════════════════════════════════════')
console.log('  CHANGE PASSWORD — ALL TESTS PASSED')
console.log('══════════════════════════════════════\n')
process.exit(0)
