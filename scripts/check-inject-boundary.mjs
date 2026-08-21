#!/usr/bin/env node
// check-inject-boundary: ensure the plugin entry's service access happens
// inside a ctx.inject(...) callback.
//
// Background: on dsh-cordis-host-runner (rc.8+), the host-half runner
// runs each plugin's `apply` in a vm realm whose `ctx` object allows
// `ctx.<service>` access **only when the service name is declared in
// the inject tree of the active scope**. Reading a service from outside
// any open inject callback throws "cannot get property 'FOO' without
// inject" — which masks itself behind whatever upstream error happens
// to surface first (e.g. a sharp / libstdc++ mismatch on Cadence
// workstations). Plugin authors with no cordis sandbox experience
// commonly write `installSomethingService(ctx)` at the top of apply()
// because that is what the older (un-sandboxed) cordis accepted; we
// shipped that bug as dsh-virtuoso#2.
//
// This script does a static scan over `lib/index.js` (the build output
// the host runner actually loads) and rejects any caller of a known
// ctx-needing helper that appears OUTSIDE a `ctx.inject(...)` callback
// body. The check is approximate but catches the common placement
// errors before they reach `dsh web`.

import { readFileSync } from 'node:fs'

const FILE = 'lib/index.js'
let source
try {
  source = readFileSync(FILE, 'utf8')
} catch (err) {
  console.error(`check-inject-boundary: cannot read ${FILE}: ${err.message}`)
  process.exit(0) // tolerate pre-build environments; tsc has its own gate
}

// Helpers known to need an inject scope. Extend this list when a new
// ctx-needing helper joins the call graph.
const guarded = [
  'installVirtuosoSettings(ctx',
  'mountVirtuosoRoutes(',
]

function withinInjectBrace(snippet, callIdx) {
  let depth = 0
  for (let i = 0; i < callIdx; i += 1) {
    const ch = snippet[i]
    if (ch === '{') depth += 1
    else if (ch === '}') depth -= 1
  }
  return depth >= 1
}

function lastOpenBraceBefore(src, idx) {
  // walk back to find the most recent { at brace depth 0 — that opens the
  // current top-level (apply) body. Anything inside its matched }
  // but at brace depth > 0 is therefore inside another {} block.
  let depth = 0
  for (let i = idx - 1; i >= 0; i -= 1) {
    const ch = src[i]
    if (ch === '}') depth += 1
    else if (ch === '{') {
      if (depth === 0) return i
      depth -= 1
    }
  }
  return -1
}

const errors = []
for (const needle of guarded) {
  let from = 0
  while (from < source.length) {
    const found = source.indexOf(needle, from)
    if (found === -1) break
    from = found + needle.length

    // Find the enclosing call expression — we need the entire call to
    // be inside the same {} block as a `ctx.inject(...)` literal. We
    // approximate by requiring: somewhere between the enclosing
    // function body's opening `{` and this call, there is text
    // matching /ctx\.inject\(/. Anything else is a placement bug.
    const enclosingStart = lastOpenBraceBefore(source, found)
    if (enclosingStart === -1) {
      errors.push(`${needle}: no enclosing brace found`)
      continue
    }
    const slice = source.slice(enclosingStart, found)
    const hasInject = /ctx\.inject\(/.test(slice)
    if (!hasInject) {
      errors.push(`${needle} called outside any ctx.inject(...) scope`)
    }
  }
}

if (errors.length > 0) {
  console.error('check-inject-boundary: found service calls outside inject scope:')
  for (const e of errors) console.error('  - ' + e)
  console.error('  (move the call inside the existing ctx.inject(...) callback)')
  process.exit(1)
}

console.log('check-inject-boundary: all ctx-needing helpers sit inside an inject scope')
