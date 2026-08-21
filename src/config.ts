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
  /** Raw `VB_REMOTE_HOST` value, or null when unset. The tunnel/start
   * route keys off `isRemote` below; this field is the displayed value
   * in the settings panel, which should show the truth rather than a
   * legacy default of "localhost". */
  remoteHost: string | null
  /** True unless `VB_REMOTE_HOST` is unset, empty, or points at the
   * local box. Local mode skips the SSH tunnel entirely. */
  isRemote: boolean
  jumpHost: string | null
  clientId: string | null
  cacheDir: string
  logDir: string
}

/** Default port virtuoso-cli assigns when no `VB_PORT` is exported. */
const DEFAULT_PORT = 0

/** Default timeout for `vcli skill exec` (matches vcli default of 30 s). */
const DEFAULT_TIMEOUT = 30

/**
 * TTL for the `findVcliOnPath` cache. The panel polls `/dsh-virtuoso/status`
 * on every refresh; on a long `PATH` (10+ entries) that adds up to dozens of
 * `stat` calls per poll. Caching the path lookup keeps the panel snappy
 * without breaking the "PATH changed → re-detect" expectation: 30 s is short
 * enough that a manual `cargo install virtuoso-cli && restart dsh web` picks
 * up the new binary on the next refresh, long enough that no single user
 * interaction feels the latency.
 */
const BINARY_CACHE_TTL_MS = 30_000

interface BinaryCache {
  path: string | null
  /** `Date.now()` of the lookup; `Infinity` when the PATH used was empty. */
  expiresAt: number
  /** PATH string at the time of the lookup; a change in PATH busts the cache. */
  pathEnv: string
}

let binaryCache: BinaryCache | null = null

/** Path-less binary lookup, mirroring the vcli `which vcli` step on start. */
function findVcliOnPath(): string | null {
  const pathEnv = process.env.PATH ?? process.env.Path ?? process.env.path ?? ''
  const now = Date.now()
  if (binaryCache !== null
      && binaryCache.pathEnv === pathEnv
      && binaryCache.expiresAt > now) {
    return binaryCache.path
  }
  // We don't shell out — `which` adds latency the settings panel would feel
  // every refresh. Walk PATH manually and accept the platform-native
  // executable suffix.
  const sep = process.platform === 'win32' ? ';' : ':'
  const suffixes = process.platform === 'win32' ? ['', '.cmd', '.exe'] : ['']
  let found: string | null = null
  for (const dir of pathEnv.split(sep)) {
    if (!dir) continue
    for (const suffix of suffixes) {
      const candidate = join(dir, 'vcli' + suffix)
      if (existsSync(candidate)) { found = candidate; break }
    }
    if (found !== null) break
  }
  binaryCache = {
    path: found,
    // If PATH is empty, don't bother re-statting on every call — there is
    // nothing to find. Use a sentinel `Infinity` so the cache lives until
    // PATH is set.
    expiresAt: pathEnv === '' ? Number.POSITIVE_INFINITY : now + BINARY_CACHE_TTL_MS,
    pathEnv,
  }
  return found
}

/**
 * Test-only hook to clear the binary-path cache. Production code never
 * needs this; `cargo install virtuoso-cli && restart dsh web` picks up the
 * new binary on next start. Tests use it to reset state between cases.
 */
export function _resetBinaryCacheForTests(): void {
  binaryCache = null
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
  const rawRemote = process.env.VB_REMOTE_HOST?.trim() ?? ''
  const remoteHost = rawRemote === '' ? null : rawRemote
  // Local mode = unset, empty, or pointing at the local box. vcli's
  // `tunnel start` otherwise attempts `ssh "" uname -m` and fails.
  const isRemote = remoteHost !== null && remoteHost !== 'localhost' && remoteHost !== '127.0.0.1'
  return {
    hasBinary: binaryPath !== null,
    binaryPath,
    host: process.env.VB_HOST ?? '127.0.0.1',
    port: Number.parseInt(process.env.VB_PORT ?? String(DEFAULT_PORT), 10) || DEFAULT_PORT,
    session: process.env.VB_SESSION ?? null,
    timeoutSeconds: parseTimeout(process.env.VB_TIMEOUT),
    remoteHost,
    isRemote,
    jumpHost: process.env.VB_JUMP_HOST ?? null,
    clientId: process.env.VB_CLIENT_ID ?? null,
    cacheDir: cacheHome,
    logDir: process.env.VB_LOG_DIR ?? join(cacheHome, 'logs'),
  }
}
