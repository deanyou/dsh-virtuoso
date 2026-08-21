#!/usr/bin/env node
// install-locally: pack this plugin then `dsh plugin` install the tarball.
//
// Why this exists: `dsh plugin --profile web add ./foo.tgz` does NOT pack
// the directory for you. It passes the path verbatim to pnpm; pnpm then
// tries to open the file, fails with ENOENT, and aborts. The two-step
// path (pack → add) caught at least one operator (#1) in this repo's
// history. Centralising it here means the canonical local-install flow
// is one command and is reproducible from a fresh clone.
//
// Flags:
//   --profile <name>    DSH profile to install into (default: web)
//   --no-clean          keep the produced tarball after install (default: rm)
//   --no-cache-override skip the project-local npm cache override
//
// Exits non-zero on either step's failure. Never silently swallows the
// pnpm/dsh error stream — it is printed verbatim so a failing install
// shows the same banner a hand-typed pack-and-add pair did.

import { spawnSync } from 'node:child_process'
import { existsSync, unlinkSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

function arg(name, fallback) {
  const i = process.argv.indexOf(name)
  if (i !== -1 && i + 1 < process.argv.length) return process.argv[i + 1]
  return fallback
}
function flag(name) {
  return process.argv.includes(name)
}

const profile = arg('--profile', 'web')
const keepTarball = flag('--no-clean')
const noCacheOverride = flag('--no-cache-override')

function run(cmd, args, label) {
  console.log(`\n[install-locally] ${label}: ${cmd} ${args.join(' ')}`)
  const env = { ...process.env }
  if (!noCacheOverride && env.NPM_CONFIG_CACHE === undefined) {
    // Point npm at the project-local cache if one is configured. Some
    // sandboxes ship a /root-owned global ~/.npm; without this override
    // `npm pack`'s metadata fetch triggers an EACCES that looks like a
    // code problem (#1 follow-up).
    env.NPM_CONFIG_CACHE = './npm-cache'
  }
  const result = spawnSync(cmd, args, { stdio: 'inherit', env })
  if (result.status !== 0) {
    console.error(`[install-locally] ${label} failed (exit ${result.status}); aborting before dsh plugin add`)
    process.exit(result.status ?? 1)
  }
}

// Pack so a stable *.tgz exists. --pack-destination keeps the output at the
// repo root (npm defaults to wherever you stand) regardless of `pwd`.
const cwd = process.cwd()
run('npm', ['pack', '--pack-destination', cwd], 'npm pack')

// npm pack writes exactly one tarball into cwd; find it without trusting a
// hardcoded version string (the version moves).
const tgz = readdirSync(cwd).find((f) => /^dsh-virtuoso.*\.tgz$/.test(f))
if (tgz === undefined) {
  console.error('[install-locally] no dsh-virtuoso-*.tgz found after npm pack; aborting')
  process.exit(1)
}
const tgzPath = join(cwd, tgz)
console.log(`[install-locally] produced ${tgzPath}`)

try {
  run('dsh', ['plugin', '--profile', profile, 'add', tgzPath], 'dsh plugin add')
} finally {
  if (!keepTarball && existsSync(tgzPath)) {
    unlinkSync(tgzPath)
    console.log(`[install-locally] removed ${tgz} (use --no-clean to keep)`)
  }
}

console.log(`\n[install-locally] done. Restart 'dsh ${profile === 'web' ? 'web' : `web --profile ${profile}`}' to load.`)
