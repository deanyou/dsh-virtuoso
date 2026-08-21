/**
 * Response shapes of the `/dsh-virtuoso/*` host routes plus the pure helpers
 * shared between `VirtuosoSection` (settings) and `SettingsCard` (plugin
 * configuration page).
 *
 * The structure mirrors `market-data.ts` in dsh-market — same Translate
 * generator, same loader-data typing — so the bundler treats this module
 * type-only w.r.t. the host (no runtime dependency back into `src/`).
 */

export type LocalizedText = Record<string, string | undefined>

/** Subset of `vcli --version` lines / `which vcli` results. */
export interface VirtuosoStatus {
  pluginVersion: string
  profile: string
  allowTunnelStart: boolean
  allowRestart: boolean
  cli: {
    hasBinary: boolean
    host: string
    port: number
    session: string | null
    timeoutSeconds: number
    /** `VB_REMOTE_HOST` value, or null when unset. Use this to decide
     * whether to render the tunnel section as remote-mode or local-mode. */
    remoteHost: string | null
    /** Resolved from `VB_REMOTE_HOST`: false when unset, empty, or local. */
    isRemote: boolean
    jumpHost: string | null
    clientId: string | null
    cacheDir: string
    logDir: string
  }
  skills: BundledSkillSummary[]
}

export interface BundledSkillSummary {
  id: string
  name: string
  description: string
  parsed: boolean
  bytes: number
}

/** Subset of `vcli session list --format json`. */
export interface VirtuosoSessionInfo {
  id?: string
  host?: string
  port?: number
  user?: string
  pid?: number
  created?: string
}

/** Response shape of `/dsh-virtuoso/sessions`. */
export interface VirtuosoSessions {
  sessions: VirtuosoSessionInfo[]
  count: number
  status: 'success' | 'error'
  error?: string
  /** Set when vcli output could not be parsed. */
  raw?: string
  note?: string
}

/** Subset of `/dsh-virtuoso/ping` and `/tunnel/*` responses. */
export interface VcliCallOutcome {
  ok: boolean
  stdout: string
  stderr: string
  durationMs: number
  code?: number | null
  reason?: string
  version?: string
  /** Set by tunnel/start when short-circuited in local mode. */
  mode?: 'local' | 'remote'
  /** Human-readable explanation of the response — the panel surfaces this
   * when the route takes a non-default path (e.g. local-mode probe). */
  note?: string
}

/**
 * Redact file paths from a stderr string.
 *
 * Used by `CallResult` for shared-kiosk deployments where the panel is
 * visible to a wider audience and raw paths like
 * `/home/user1/.cache/virtuoso_bridge/...` would leak the operator's
 * username. Replaces anything matching an absolute path or
 * `/path/...` with `[PATH]` — preserves enough information for the
 * operator to debug (the shape of the error) without exposing real
 * filesystem layout.
 *
 * Not server-side: the route returns the raw stderr so the operator's
 * own copy of the panel can show full detail; the redaction is purely
 * a presentation concern.
 */
export function redactPaths(input: string): string {
  return input
    // Absolute Unix paths: /foo/bar/baz
    .replace(/\/(?:[\w.-]+)(?:\/[\w.-]+)+/g, '[PATH]')
    // Windows-style paths: C:\foo\bar
    .replace(/[A-Z]:\\(?:[\w.-]+\\?)+/gi, '[PATH]')
    // ~-relative paths
    .replace(/~?\/[\w.~-]+(?:\/[\w.~-]+)+/g, '[PATH]')
}

export type Translate = (key: string) => string

/**
 * Build a translate function from a locale dictionary.
 * Falls back to the key when no entry matches — the panel already gates
 * against empty strings (#i18n:no-silent-drop).
 */
export function makeTranslator(dict: Record<string, string>): Translate {
  return (key: string) => dict[key] ?? key
}
