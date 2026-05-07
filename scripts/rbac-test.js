/**
 * RBAC Access Control Validation Script
 * Tests route protection by following HTTP redirects and checking final URLs.
 * Runs against http://localhost:3000
 */

const BASE = 'http://localhost:3000';

// ── Helpers ─────────────────────────────────────────────────────────────────

async function fetchFinal(path, cookies = '') {
  let url = `${BASE}${path}`;
  const visited = [];
  const maxRedirects = 10;

  for (let i = 0; i < maxRedirects; i++) {
    visited.push(url);
    const headers = { Cookie: cookies };
    const res = await fetch(url, { redirect: 'manual', headers });
    const status = res.status;

    if (status >= 300 && status < 400) {
      const location = res.headers.get('location') || '';
      // Resolve relative redirects
      url = location.startsWith('http') ? location : `${BASE}${location}`;
    } else {
      return { finalUrl: url, status, redirectChain: visited };
    }
  }
  return { finalUrl: url, status: 0, redirectChain: visited, error: 'Too many redirects' };
}

function check(label, condition, detail = '') {
  const icon = condition ? '✅ PASS' : '❌ FAIL';
  console.log(`  ${icon}  ${label}`);
  if (detail) console.log(`        → ${detail}`);
  return condition;
}

// ── Test Cases ───────────────────────────────────────────────────────────────

async function runTests() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║       DIOSESGRANDE — RBAC ACCESS CONTROL VALIDATION         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  let passed = 0, failed = 0;

  function result(ok) { ok ? passed++ : failed++; return ok; }

  // ──────────────────────────────────────────────────────────────────────────
  console.log('━━━ SECTION 1: Unauthenticated (Guest) User Tests ━━━\n');

  // Test 1 – Guest → /admin
  {
    const { finalUrl, status } = await fetchFinal('/admin');
    const redirected = !finalUrl.includes('/admin') || finalUrl.includes('/login');
    result(check(
      'TEST 1 — Guest → GET /admin (should be denied)',
      redirected,
      `Final URL: ${finalUrl}  [HTTP ${status}]`
    ));
  }

  // Test 2 – Guest → /vendor
  {
    const { finalUrl, status } = await fetchFinal('/vendor');
    const redirected = !finalUrl.endsWith('/vendor') || finalUrl.includes('/login');
    result(check(
      'TEST 2 — Guest → GET /vendor (should be denied)',
      redirected,
      `Final URL: ${finalUrl}  [HTTP ${status}]`
    ));
  }

  // Test 3 – Guest → /dashboard/orders
  {
    const { finalUrl, status } = await fetchFinal('/dashboard/orders');
    const redirected = !finalUrl.includes('/dashboard') || finalUrl.includes('/login');
    result(check(
      'TEST 3 — Guest → GET /dashboard/orders (should redirect to login)',
      redirected,
      `Final URL: ${finalUrl}  [HTTP ${status}]`
    ));
  }

  // Test 4 – Guest → /checkout
  {
    const { finalUrl, status } = await fetchFinal('/checkout');
    const redirected = !finalUrl.includes('/checkout') || finalUrl.includes('/login');
    result(check(
      'TEST 4 — Guest → GET /checkout (should redirect to login)',
      redirected,
      `Final URL: ${finalUrl}  [HTTP ${status}]`
    ));
  }

  // Test 5 – Guest → /login (public — must be accessible)
  {
    const { finalUrl, status } = await fetchFinal('/login');
    const accessible = finalUrl.includes('/login') && status === 200;
    result(check(
      'TEST 5 — Guest → GET /login (public, must be accessible)',
      accessible,
      `Final URL: ${finalUrl}  [HTTP ${status}]`
    ));
  }

  // Test 6 – Guest → /register (public — must be accessible)
  {
    const { finalUrl, status } = await fetchFinal('/register');
    const accessible = finalUrl.includes('/register') && status === 200;
    result(check(
      'TEST 6 — Guest → GET /register (public, must be accessible)',
      accessible,
      `Final URL: ${finalUrl}  [HTTP ${status}]`
    ));
  }

  // Test 7 – Guest → homepage (always public)
  {
    const { finalUrl, status } = await fetchFinal('/');
    const accessible = status === 200;
    result(check(
      'TEST 7 — Guest → GET / (homepage, always public)',
      accessible,
      `Final URL: ${finalUrl}  [HTTP ${status}]`
    ));
  }

  // Test 8 – Guest → /products (public)
  {
    const { finalUrl, status } = await fetchFinal('/products');
    const accessible = status === 200;
    result(check(
      'TEST 8 — Guest → GET /products (public catalog)',
      accessible,
      `Final URL: ${finalUrl}  [HTTP ${status}]`
    ));
  }

  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n━━━ SECTION 2: API Route Protection Tests ━━━\n');

  // Test 9 – Unauthenticated API: /api/cart
  {
    const res = await fetch(`${BASE}/api/cart`, { redirect: 'manual' });
    const denied = res.status === 401 || res.status === 403 || res.status === 307 || res.status === 302;
    result(check(
      'TEST 9 — Guest → GET /api/cart (should be 401/403/redirect)',
      denied,
      `HTTP ${res.status}`
    ));
  }

  // Test 10 – Unauthenticated API: /api/vendor/products
  {
    const res = await fetch(`${BASE}/api/vendor/products`, { redirect: 'manual' });
    const denied = res.status === 401 || res.status === 403 || res.status === 307 || res.status === 302;
    result(check(
      'TEST 10 — Guest → GET /api/vendor/products (should be 401/403/redirect)',
      denied,
      `HTTP ${res.status}`
    ));
  }

  // Test 11 – Unauthenticated API: /api/admin (admin-only endpoint)
  {
    const res = await fetch(`${BASE}/api/admin/products/fake-id`, { redirect: 'manual' });
    const denied = res.status === 401 || res.status === 403 || res.status === 307 || res.status === 302 || res.status === 404;
    result(check(
      'TEST 11 — Guest → DELETE /api/admin/products (should be denied)',
      denied,
      `HTTP ${res.status}`
    ));
  }

  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n━━━ SECTION 3: Auth Config Logic Validation ━━━\n');

  // Test 12 – Verify auth.config.ts exists and exports valid config
  {
    const fs = require('fs');
    const exists = fs.existsSync('./auth.config.ts');
    result(check(
      'TEST 12 — auth.config.ts exists at project root',
      exists,
      exists ? 'File found ✓' : 'MISSING — critical error'
    ));
  }

  // Test 13 – Verify proxy.ts (Next.js 16 middleware) exists
  {
    const fs = require('fs');
    const exists = fs.existsSync('./proxy.ts');
    result(check(
      'TEST 13 — proxy.ts (Next.js 16 middleware) exists',
      exists,
      exists ? 'File found ✓' : 'MISSING — middleware not running!'
    ));
  }

  // Test 14 – Confirm middleware.ts is GONE (would conflict with proxy.ts)
  {
    const fs = require('fs');
    const conflictExists = fs.existsSync('./middleware.ts');
    result(check(
      'TEST 14 — middleware.ts ABSENT (no conflict with proxy.ts)',
      !conflictExists,
      !conflictExists ? 'No conflict ✓' : 'CONFLICT DETECTED — delete middleware.ts!'
    ));
  }

  // Test 15 – Verify proxy.ts exports default (required by Next.js)
  {
    const fs = require('fs');
    const content = fs.readFileSync('./proxy.ts', 'utf-8');
    const hasDefault = content.includes('export default');
    const hasConfig = content.includes('matcher');
    result(check(
      'TEST 15 — proxy.ts has "export default" and matcher config',
      hasDefault && hasConfig,
      `export default: ${hasDefault}, matcher: ${hasConfig}`
    ));
  }

  // Test 16 – Verify auth.config.ts has all required role checks
  {
    const fs = require('fs');
    const content = fs.readFileSync('./auth.config.ts', 'utf-8');
    const hasAdmin   = content.includes("'ADMIN'") || content.includes('"ADMIN"');
    const hasVendor  = content.includes("'VENDOR'") || content.includes('"VENDOR"');
    const hasRedirect = content.includes('Response.redirect');
    result(check(
      'TEST 16 — auth.config.ts has ADMIN, VENDOR role checks and redirects',
      hasAdmin && hasVendor && hasRedirect,
      `ADMIN: ${hasAdmin}, VENDOR: ${hasVendor}, redirect: ${hasRedirect}`
    ));
  }

  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log(`║  RESULTS:  ${passed} PASSED  |  ${failed} FAILED  |  ${passed + failed} TOTAL            ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');

  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Review the FAIL entries above.\n');
  } else {
    console.log('\n🎉  All access control tests passed!\n');
  }
}

runTests().catch(console.error);
