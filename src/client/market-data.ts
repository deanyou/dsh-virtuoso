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
    remoteHost: string
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

/** Subset of `/dsh-virtuoso/ping` and `/tunnel/*` responses. */
export interface VcliCallOutcome {
  ok: boolean
  stdout: string
  stderr: string
  durationMs: number
  code?: number | null
  reason?: string
  version?: string
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
