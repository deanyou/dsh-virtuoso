#!/usr/bin/env node
// Sync the upstream virtuoso-cli skill tree into bundled-skill/.
//
// Why a sync script rather than checking the skills in directly:
//   - virtuoso-cli is the source of truth for skill descriptions and examples
//   - we rewrite the frontmatter allowed-tools gate so the bundled skills
//     instruct the agent to call vcli (and keep the historical
//     `virtuoso` alias for users that name the binary the other way)
//   - keeps diffs tiny and traceable (auditability:git-blame).
//
// Usage:
//   node scripts/sync-skills.mjs [path/to/virtuoso-cli]   (default ../virtuoso-cli)
//
// Exits non-zero if upstream is missing or the SKILL count drops below 14
// (we currently ship 18; the floor catches a broken rename).

import { readdirSync, readFileSync, writeFileSync, statSync, mkdirSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const REPO = process.argv[2] ?? join(import.meta.dirname || '', '..', '..', 'virtuoso-cli')
const SRC = join(REPO, '.agents', 'skills')
const DST = join(import.meta.dirname || '', '..', 'bundled-skill')
const SKILL_FLOOR = 14

if (!existsSync(SRC)) {
  console.error(`sync-skills: upstream skills not found at ${SRC}`)
  console.error('sync-skills: clone https://github.com/deanyou/virtuoso-cli.git or pass the path as argv[2]')
  process.exit(1)
}

// Fresh tree so removed skills disappear from the bundle rather than linger.
rmSync(DST, { recursive: true, force: true })
mkdirSync(DST, { recursive: true })

const entries = readdirSync(SRC, { withFileTypes: true }).filter(d => d.isDirectory())

let copied = 0
for (const entry of entries) {
  const srcFile = join(SRC, entry.name, 'SKILL.md')
  if (!existsSync(srcFile)) continue
  const stat = statSync(srcFile)
  if (!stat.isFile()) continue
  let body = readFileSync(srcFile, 'utf8')

  // Split frontmatter from body so we only rewrite the gate line, not the
  // shell examples the agent is expected to type verbatim.
  const openFence = body.indexOf('---')
  if (openFence === 0) {
    const closeFence = body.indexOf('\n---', 3)
    if (closeFence !== -1) {
      const closeEnd = body.indexOf('\n', closeFence + 4)
      const head = body.slice(0, closeEnd !== -1 ? closeEnd + 1 : closeFence + 4)
      const tail = body.slice(closeEnd !== -1 ? closeEnd + 1 : closeFence + 4)
      const rewrittenHead = head.replace(
        /^allowed-tools:\s*Bash\(\\\*\/virtuoso \*\\\)\s*$/m,
        'allowed-tools: Bash(*/vcli *) Bash(*/virtuoso *) Read Write Edit',
      ).replace(
        /^allowed-tools:\s*(.*)$/m,
        (match, rest) => match.startsWith('allowed-tools: Bash(*/vcli') ? match : `allowed-tools: Bash(*/vcli *) Bash(*/virtuoso *) Read Write Edit`,
      )
      body = rewrittenHead + tail
    }
  }

  const dstDir = join(DST, entry.name)
  mkdirSync(dstDir, { recursive: true })
  writeFileSync(join(dstDir, 'SKILL.md'), body, 'utf8')
  copied += 1
}

if (copied < SKILL_FLOOR) {
  console.error(`sync-skills: only ${copied} skills copied, below floor of ${SKILL_FLOOR}; aborting`)
  process.exit(2)
}

console.log(`sync-skills: copied ${copied} skills from ${SRC} -> ${DST}`)
