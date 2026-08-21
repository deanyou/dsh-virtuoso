#!/usr/bin/env node
// publish-npm: publish dsh-virtuoso to the npm registry.
//
// Why this exists as its own script (not just `npm publish`):
//   - The sandbox running this command can't write to ~/.npm/, so
//     npm needs `npm_config_cache` pointed at the project-local cache.
//   - The user's npm account requires either 2FA or a granular access
//     token with "Bypass 2FA" enabled. The token lives in .npmrc
//     (gitignored) so it doesn't leak into git.
//
// Pre-flight: runs `npm run check` first, then `npm publish --dry-run`
// to surface any issue before the real publish.
//
// Usage:
//   node scripts/publish-npm.mjs                 # dry-run
//   node scripts/publish-npm.mjs --publish        # actually publish
//
// Exit codes:
//   0  success (or dry-run clean)
//   1  preflight (check) failed
//   2  dry-run had warnings
//   3  publish failed

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'

const repoRoot = new URL('..', import.meta.url).pathname
const npmrcPath = `${repoRoot}.npmrc`
const publish = process.argv.includes('--publish')

// 1. Token check — surface a clear hint before npm does.
if (!existsSync(npmrcPath)) {
  console.error('publish-npm: .npmrc missing at repo root')
  console.error('publish-npm: create it with:')
  console.error('publish-npm:   echo \'//registry.npmjs.org/:_authToken=<TOKEN>\' > .npmrc')
  console.error('publish-npm: The .npmrc file is gitignored.')
  process.exit(3)
}
const tokenLine = readFileSync(npmrcPath, 'utf8').split('\n').find((l) => l.includes('_authToken'))
if (!tokenLine) {
  console.error('publish-npm: .npmrc exists but no _authToken line found')
  process.exit(3)
}

// 2. Cache sanity check — the sandbox may have a stale ~/.npm that
// npm tries to use. Force the project-local cache.
process.env.NPM_CONFIG_CACHE = `${repoRoot}npm-cache`

// 3. Run `npm run check` (typecheck + build + skills + inject + tests).
console.log('[publish-npm] running preflight: npm run check')
const check = spawnSync('npm', ['run', 'check'], {
  cwd: repoRoot,
  stdio: 'inherit',
  env: process.env,
})
if (check.status !== 0) {
  console.error(`[publish-npm] preflight failed (exit ${check.status}); not publishing`)
  process.exit(1)
}

// 4. Dry-run first unless `--publish` was passed.
const dryRun = spawnSync('npm', ['publish', '--dry-run', '--access', 'public'], {
  cwd: repoRoot,
  stdio: 'inherit',
  env: process.env,
})
if (dryRun.status !== 0) {
  console.error(`[publish-npm] dry-run failed (exit ${dryRun.status})`)
  process.exit(2)
}

if (!publish) {
  console.log('[publish-npm] dry-run OK; re-run with --publish to push')
  process.exit(0)
}

// 5. Real publish.
console.log('\n[publish-npm] === publishing to npm ===\n')
const real = spawnSync('npm', ['publish', '--access', 'public'], {
  cwd: repoRoot,
  stdio: 'inherit',
  env: process.env,
})
if (real.status !== 0) {
  console.error(`[publish-npm] publish failed (exit ${real.status})`)
  // Common case: 403 with "Two-factor authentication ... required".
  console.error('')
  console.error('[publish-npm] common cause: 2FA bypass not enabled on the token.')
  console.error('[publish-npm]   - Enable 2FA on the npm account, OR')
  console.error('[publish-npm]   - Generate a granular access token with "Bypass 2FA" enabled')
  console.error('[publish-npm]   - Regenerate .npmrc with the new token')
  process.exit(3)
}

console.log('\n[publish-npm] === published ===')
console.log('[publish-npm] verify:  npm view dsh-virtuoso')