/**
 * The plugin's own version, read once from its installed package.json.
 *
 * The settings UI shows this in the page heading next to the installed
 * `vcli` version so a screenshot of any issue carries both versions — most
 * bug reports arrive without a version in frame, and the first reply always
 * has to ask which one it was. Mirrors the dsh-market pattern (#246).
 */

import { readFileSync } from 'node:fs'

const pkgUrl = new URL('../package.json', import.meta.url)

let cached: string | null = null

export function version(): string {
  if (cached !== null) return cached
  try {
    const manifest = JSON.parse(readFileSync(pkgUrl, 'utf8')) as { version?: string }
    cached = manifest.version ?? 'unknown'
  } catch {
    cached = 'unknown'
  }
  return cached
}
