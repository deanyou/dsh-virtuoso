#!/usr/bin/env node
// Validate the bundled-skill/ tree against the upstream source tree.
//
// Walks `bundled-skill/<id>/SKILL.md`, asserts every file begins with a
// YAML frontmatter that has `name`, `description`, and `allowed-tools`.
//
// Why `allowed-tools` is required: the plugin's trust contract is that
// every bundled skill restricts the model to vcli (or the legacy
// virtuoso alias) plus Read/Write/Edit on local files. Any skill that
// ships without an `allowed-tools` line inherits the host's default tool
// set, which is much wider and an attacker could pivot through it
// (issue #trust:allowed-tools). See sync-skills.mjs for the rewrite that
// enforces the gate on every copy.
//
// Exit code 1 on the first parse issue so a CI pre-publish step catches a
// broken upstream sync (#integrity:prepublish).

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(import.meta.dirname || '', '..', 'bundled-skill')
let problems = 0
let count = 0

function parseFrontmatter(body) {
  if (!body.startsWith('---')) return null
  const close = body.indexOf('\n---', 3)
  if (close === -1) return null
  return body.slice(3, close).trim()
}

let ids
try {
  ids = readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()
} catch (err) {
  console.error(`validate-skills: cannot list ${ROOT}: ${err.message}`)
  process.exit(1)
}

for (const id of ids) {
  const file = join(ROOT, id, 'SKILL.md')
  let body
  try {
    const stat = statSync(file)
    if (!stat.isFile()) continue
    body = readFileSync(file, 'utf8')
  } catch {
    console.error(`validate-skills: ${id}: cannot read`)
    problems += 1
    continue
  }
  count += 1
  const fm = parseFrontmatter(body)
  if (fm === null) {
    console.error(`validate-skills: ${id}: missing frontmatter`)
    problems += 1
    continue
  }
  const hasName = /^name:\s*\S/m.test(fm)
  const hasDesc = /^description:\s*(.+)$/m.test(fm) || /^description:\s*\|/m.test(fm)
  const hasTools = /^allowed-tools:\s*\S/m.test(fm)
  if (!hasName) {
    console.error(`validate-skills: ${id}: missing 'name:'`)
    problems += 1
  }
  if (!hasDesc) {
    console.error(`validate-skills: ${id}: missing 'description:'`)
    problems += 1
  }
  if (!hasTools) {
    console.error(`validate-skills: ${id}: missing 'allowed-tools:' (model can use any tool; run scripts/sync-skills.mjs to fix)`)
    problems += 1
  }
}

if (problems > 0) {
  console.error(`validate-skills: ${count - problems}/${count} skills passed; aborting`)
  process.exit(1)
}

console.log(`validate-skills: ${count} skills OK`)
