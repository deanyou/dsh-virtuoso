#!/usr/bin/env node
/**
 * Preflight: assert the emitted `client/client.js` starts with the
 * `window.__ModuleLoader__.load({` banner tsdown emits per `tsdown.config.ts`.
 * This is the contract the host loader uses to bind the bundle to its
 * module table — a missing or renamed banner makes the plugin dead on
 * arrival, which fails with a quieter runtime error than a build error.
 *
 * This script does NOT modify the bundle — it is a read-only assertion.
 * tsdown's banner/footer config in `tsdown.config.ts` is the source of
 * truth; this script catches drift if the config is changed incompatibly.
 *
 * Mirrors the dsh-market preflight step (used in their `prepack`).
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const FILE = join(import.meta.dirname || '', '..', 'client', 'client.js')

let text
try {
  text = readFileSync(FILE, 'utf8')
} catch (err) {
  console.error(`check-client-banner: cannot read ${FILE}: ${err.message}`)
  process.exit(1)
}

const id = '"dsh-virtuoso"'
const expectedPrefix = 'window.__ModuleLoader__.load({'
// tsdown 0.22+ formats the banner with newlines and tabs between fields; the
// dsh-market preflight asserts on the older single-line form. Accept both by
// checking only the starting substring and the id token's presence inside it.
if (!text.startsWith(expectedPrefix)) {
  console.error('check-client-banner: client.js does not start with the expected banner')
  console.error('  expected prefix:', expectedPrefix)
  console.error('  actual prefix:   ', text.slice(0, expectedPrefix.length))
  process.exit(2)
}
if (!text.includes(`id: ${id}`) || !text.includes('factory:')) {
  console.error('check-client-banner: client.js banner is malformed (missing id/factory tokens)')
  process.exit(2)
}

console.log('check-client-banner: client.js banner OK')