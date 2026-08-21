/**
 * Resolved vcli configuration, modeled after virtuoso-cli `Config::from_env`
 * in src/config.rs. We don't shell out to `vcli config dump` — the daemon
 * may not be installed, the user may be remote-only, and the settings panel
 * wants to render fields regardless. The Runtime row each field maps to is
 * the same VB_* env var virtuoso-cli itself consumes.
 */

import { existsSync } from 'node:fs'
import { join } from 'node:path'

/** Resolved vcli configuration. Mirrors `Config::from_env` in vcli. */
export interface VirtuosoCliConfig {
  /** Whether the local `vcli` binary was found in PATH. */
  hasBinary: boolean
  /** Resolved absolute path of `vcli`, or null if not found. */
  binaryPath: string | null
  host: string
  port: number
  session: string | null
  timeoutSeconds: number
  remoteHost: string
  jumpHost: string | null
  clientId: string | null
  cacheDir: string
  logDir: string
}

/** Default port virtuoso-cli assigns when no `VB_PORT` is exported. */
const DEFAULT_PORT = 0

/** Default timeout for `vcli skill exec` (matches vcli default of 30 s). */
const DEFAULT_TIMEOUT = 30

/** Path-less binary lookup, mirroring the vcli `which vcli` step on start. */
function findVcliOnPath(): string | null {
  // We don't shell out — `which` adds latency the settings panel would feel
  // every refresh. Walk PATH manually and accept the platform-native
  // executable suffix.
  const pathEnv = process.env.PATH ?? process.env.Path ?? process.env.path ?? ''
  const sep = process.platform === 'win32' ? ';' : ':'
  const suffixes = process.platform === 'win32' ? ['', '.cmd', '.exe'] : ['']
  for (const dir of pathEnv.split(sep)) {
    if (!dir) continue
    for (const suffix of suffixes) {
      const candidate = join(dir, 'vcli' + suffix)
      if (existsSync(candidate)) return candidate
    }
  }
  return null
}

/**
 * Coerce a VB_TIMEOUT string into a sane positive integer.
 *
 * `parseInt('abc')` silently returns NaN; the timeout semantics then become
 * `setTimeout(NaN)` which Node clamps to 1ms. Catching that here keeps the
 * settings panel honest (#traps:empty-string).
 */
function parseTimeout(raw: string | undefined): number {
  if (raw === undefined || raw.trim() === '') return DEFAULT_TIMEOUT
  const value = Number.parseInt(raw, 10)
  if (!Number.isFinite(value) || value <= 0) return DEFAULT_TIMEOUT
  return value
}

/**
 * Read the resolved vcli configuration from the host process environment.
 * Safe to call repeatedly — it is pure and has no I/O beyond `findVcliOnPath`.
 */
export function readVirtuosoCliConfig(): VirtuosoCliConfig {
  const binaryPath = findVcliOnPath()
  const home = process.env.HOME ?? process.env.USERPROFILE ?? '/tmp'
  const cacheHome = process.env.VB_CACHE_DIR ?? join(home, '.cache', 'virtuoso_bridge')
  return {
    hasBinary: binaryPath !== null,
    binaryPath,
    host: process.env.VB_HOST ?? '127.0.0.1',
    port: Number.parseInt(process.env.VB_PORT ?? String(DEFAULT_PORT), 10) || DEFAULT_PORT,
    session: process.env.VB_SESSION ?? null,
    timeoutSeconds: parseTimeout(process.env.VB_TIMEOUT),
    remoteHost: process.env.VB_REMOTE_HOST ?? 'localhost',
    jumpHost: process.env.VB_JUMP_HOST ?? null,
    clientId: process.env.VB_CLIENT_ID ?? null,
    cacheDir: cacheHome,
    logDir: process.env.VB_LOG_DIR ?? join(cacheHome, 'logs'),
  }
}
