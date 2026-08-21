/**
 * HTTP routes bridging the browser settings panel to the host.
 *
 * The plugin keeps its surface tiny — only what the settings panel needs:
 *
 *   GET  /dsh-virtuoso/status           — version, binary presence, config dump
 *   POST /dsh-virtuoso/ping             — call `vcli session list` once
 *   GET  /dsh-virtuoso/sessions         — parsed `vcli session list` JSON
 *   GET  /dsh-virtuoso/session-current  — parsed `vcli session current` JSON
 *   POST /dsh-virtuoso/tunnel/start     — call `vcli tunnel start` (remote mode)
 *                                          or probe the local daemon (local mode)
 *   POST /dsh-virtuoso/tunnel/stop      — call `vcli tunnel stop` (remote mode)
 *                                          or no-op (local mode)
 *   GET  /dsh-virtuoso/skills           — list bundled skill names + descriptions
 *   POST /dsh-virtuoso/skills/add       — write a new SKILL.md to $DSH_HOME/skills/<id>
 *
 * All post routes accept same-origin only and same-rule: same as dsh-market.
 * Every route returns JSON; the client UI consumes them via fetch.
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { dirname } from 'node:path'
import { readVirtuosoCliConfig } from './config.ts'
import { readBundledSkillSummaries } from './skills.ts'
import {
  buildSkillMarkdown,
  resolveUserSkillPath,
  validateUserSkillDraft,
  type UserSkillDraft,
} from './user-skill.ts'
import { callVcli } from './vcli.ts'
import { sendJson, sameOrigin, readJsonBody } from './http.ts'
import { version } from './version.ts'
import type { VirtuosoCliConfig } from './config.ts'

export interface WebServerService {
  register(route: {
    kind: 'exact' | 'prefix'
    path: string
    handler: (request: IncomingMessage, response: ServerResponse) => void | Promise<void>
  }): () => void
}

export interface LoaderEntryLike {
  options?: { name?: string }
}

export interface VirtuosoHost {
  webServer: WebServerService
  loader: { entries(): Iterable<LoaderEntryLike> }
  effect(callback: () => (() => void | Promise<void>) | void | Promise<void>, label: string): void
  plugin(plugin: unknown, config: unknown): { await(): Promise<unknown>; dispose(): Promise<unknown> | void }
  logger?: { info?(message: string): void; warn(message: string): void }
}

export interface VirtuosoConfig {
  profile: string
  allowTunnelStart?: boolean
  allowRestart?: boolean
  version: string
}

interface LoaderSummary {
  name: string
}

/**
 * Mount the plugin's HTTP routes on the host's web server.
 *
 * Returns a disposer; the host calls it during teardown. Mirrors the
 * dsh-market pattern where `effect()` wraps the route registration so the
 * loader's HMR recomposition can call the disposer during a patch swap.
 *
 * @param host - Acquired webServer + loader services.
 * @param resolved - Live plugin configuration read off the loader patch.
 */
export function mountVirtuosoRoutes(host: VirtuosoHost, resolved: VirtuosoConfig): () => void {
  const disposers: Array<() => void> = []
  const ctx = host as unknown as Context

  disposers.push(host.webServer.register({
    kind: 'exact',
    path: '/dsh-virtuoso/status',
    handler: async (_req, res) => {
      const cli = readVirtuosoCliConfig()
      const skills = readBundledSkillSummaries()
      sendJson(res, 200, {
        pluginVersion: version(),
        profile: resolved.profile,
        allowTunnelStart: resolved.allowTunnelStart ?? true,
        allowRestart: resolved.allowRestart ?? true,
        cli: cliSummary(cli),
        skills,
      })
    },
  }))

  disposers.push(host.webServer.register({
    kind: 'exact',
    path: '/dsh-virtuoso/ping',
    handler: async (req, res) => {
      if (!sameOrigin(req)) return sendJson(res, 403, { error: 'forbidden' })
      const cli = readVirtuosoCliConfig()
      if (cli.binaryPath === null) {
        sendJson(res, 503, { ok: false, reason: 'missing-binary' })
        return
      }
      // `vcli session show <ID>` requires a specific session ID; for the
      // settings panel's "is the daemon responsive" probe we want to list
      // registered sessions instead, which doesn't need an ID. If `VB_SESSION`
      // is set we forward it through `--session` so the user pins to one
      // instance; otherwise `session list` auto-scans.
      const sessionArgs: string[] = cli.session !== null
        ? ['session', 'list', '--session', cli.session, '--format', 'json']
        : ['session', 'list', '--format', 'json']
      const result = await callVcli(cli, { args: sessionArgs, timeoutMs: 4_000 })
      sendJson(res, result.ok ? 200 : 502, result)
    },
  }))

  /**
   * GET /dsh-virtuoso/sessions
   *
   * Returns the parsed JSON of `vcli session list --format json`. The
   * panel uses this to show *which* Virtuoso instance is currently
   * connected (host:port), not just whether the daemon is reachable —
   * the ping route only signals liveness. The session array may be empty
   * if no Virtuoso is running, or contain one entry per RBStart() call.
   *
   * Response: `{ sessions: Array<{ id, host, port, user, pid, created }>, count: number, status: 'success' | 'error', error?: string }`
   *
   * Status codes:
   *   200 — vcli ran successfully (sessions array may be empty)
   *   503 — vcli binary missing
   *   502 — vcli ran but failed; raw stderr in `error`
   */
  disposers.push(host.webServer.register({
    kind: 'exact',
    path: '/dsh-virtuoso/sessions',
    handler: async (req, res) => {
      if (!sameOrigin(req)) return sendJson(res, 403, { error: 'forbidden' })
      const cli = readVirtuosoCliConfig()
      if (cli.binaryPath === null) {
        sendJson(res, 503, { sessions: [], count: 0, status: 'error', error: 'vcli not on PATH' })
        return
      }
      const sessionArgs: string[] = cli.session !== null
        ? ['session', 'list', '--session', cli.session, '--format', 'json']
        : ['session', 'list', '--format', 'json']
      const result = await callVcli(cli, { args: sessionArgs, timeoutMs: 4_000 })
      if (!result.ok) {
        sendJson(res, 502, {
          sessions: [],
          count: 0,
          status: 'error',
          error: result.stderr || `vcli exited with code ${String(result.code)}`,
        })
        return
      }
      // vcli prints a single JSON document; parse it to surface the
      // structured array. If parsing fails (e.g. an upstream format
      // change), fall back to a status='success' shape that exposes the
      // raw stdout so the panel can still render something.
      try {
        const parsed = JSON.parse(result.stdout) as {
          sessions?: unknown
          count?: unknown
          status?: unknown
        }
        const sessions = Array.isArray(parsed.sessions) ? parsed.sessions : []
        const count = typeof parsed.count === 'number' ? parsed.count : sessions.length
        sendJson(res, 200, {
          sessions,
          count,
          status: 'success',
        })
      } catch {
        sendJson(res, 200, {
          sessions: [],
          count: 0,
          status: 'success',
          raw: result.stdout,
          note: 'vcli output was not valid JSON; raw payload returned for diagnostics',
        })
      }
    },
  }))

  /**
   * GET /dsh-virtuoso/session-current
   *
   * Returns the parsed JSON of `vcli session current --format json`. This
   * is the session that auto-routing would pick if the agent called
   * `vcli skill exec '...'` without `--session`. The panel renders an
   * "active" marker on the matching row in the sessions list, so the
   * user can see at a glance which Virtuoso the next skill invocation
   * will land on.
   *
   * Response on success (200): `{ session: string, port: number, auto_selected: boolean, status: 'success' }`
   * Response on no-sessions (200): `{ session: null, port: null, auto_selected: false, status: 'success' }`
   * Response on vcli error (502): `{ session: null, port: null, status: 'error', error: string }`
   */
  disposers.push(host.webServer.register({
    kind: 'exact',
    path: '/dsh-virtuoso/session-current',
    handler: async (req, res) => {
      if (!sameOrigin(req)) return sendJson(res, 403, { error: 'forbidden' })
      const cli = readVirtuosoCliConfig()
      if (cli.binaryPath === null) {
        sendJson(res, 503, { session: null, port: null, status: 'error', error: 'vcli not on PATH' })
        return
      }
      const result = await callVcli(cli, {
        args: cli.session !== null
          ? ['session', 'current', '--session', cli.session, '--format', 'json']
          : ['session', 'current', '--format', 'json'],
        timeoutMs: 4_000,
      })
      if (!result.ok) {
        sendJson(res, 502, {
          session: null,
          port: null,
          status: 'error',
          error: result.stderr || `vcli exited with code ${String(result.code)}`,
        })
        return
      }
      try {
        const parsed = JSON.parse(result.stdout) as {
          session?: unknown
          port?: unknown
          auto_selected?: unknown
          status?: unknown
        }
        // vcli returns `session: null` when there are no live sessions;
        // that's a 200 with an empty payload, not an error.
        if (parsed.session === null || parsed.session === undefined) {
          sendJson(res, 200, {
            session: null,
            port: null,
            auto_selected: false,
            status: 'success',
          })
          return
        }
        sendJson(res, 200, {
          session: String(parsed.session),
          port: typeof parsed.port === 'number' ? parsed.port : null,
          auto_selected: parsed.auto_selected === true,
          status: 'success',
        })
      } catch {
        sendJson(res, 502, {
          session: null,
          port: null,
          status: 'error',
          error: 'vcli output was not valid JSON',
        })
      }
    },
  }))

  disposers.push(host.webServer.register({
    kind: 'exact',
    path: '/dsh-virtuoso/tunnel/start',
    handler: async (req, res) => {
      if (!sameOrigin(req)) return sendJson(res, 403, { error: 'forbidden' })
      if (resolved.allowTunnelStart === false) {
        sendJson(res, 403, { error: 'forbidden', reason: 'allowTunnelStart=false' })
        return
      }
      const cli = readVirtuosoCliConfig()
      // Local mode: `vcli tunnel start` always tries to SSH, even when
      // VB_REMOTE_HOST is unset (it would invoke `ssh "" uname -m` and
      // fail with "Could not resolve hostname"). In local mode the daemon
      // is reached directly; the button should just confirm the local
      // daemon is responsive. Probe with `session list` and short-circuit.
      if (cli.binaryPath !== null && !cli.isRemote) {
        const probe = await callVcli(cli, { args: ['session', 'list', '--format', 'json'], timeoutMs: 4_000 })
        if (probe.ok) {
          sendJson(res, 200, {
            ok: true,
            mode: 'local',
            stdout: probe.stdout,
            stderr: '',
            durationMs: probe.durationMs,
            code: 0,
            reason: 'local-daemon',
            note: 'VB_REMOTE_HOST is unset; tunnel is not required — daemon verified via session list',
          })
          return
        }
        sendJson(res, 502, {
          ok: false,
          mode: 'local',
          stdout: probe.stdout,
          stderr: probe.stderr || 'local daemon not reachable',
          durationMs: probe.durationMs,
          code: probe.code,
          reason: 'local-daemon-unreachable',
          note: 'VB_REMOTE_HOST is unset; tunnel is not required, but no local daemon was found',
        })
        return
      }
      const result = await callVcli(cli, { args: ['tunnel', 'start'], timeoutMs: 15_000 })
      sendJson(res, result.ok ? 200 : 502, result)
    },
  }))

  disposers.push(host.webServer.register({
    kind: 'exact',
    path: '/dsh-virtuoso/tunnel/stop',
    handler: async (req, res) => {
      if (!sameOrigin(req)) return sendJson(res, 403, { error: 'forbidden' })
      const cli = readVirtuosoCliConfig()
      // Same local-mode short-circuit as tunnel/start: in local mode there
      // is no tunnel to stop. The button should still produce a clean
      // signal so the UI can clear the "starting" state.
      if (cli.binaryPath !== null && !cli.isRemote) {
        sendJson(res, 200, {
          ok: true,
          mode: 'local',
          stdout: '',
          stderr: '',
          durationMs: 0,
          code: 0,
          reason: 'local-noop',
          note: 'VB_REMOTE_HOST is unset; no tunnel to stop',
        })
        return
      }
      const result = await callVcli(cli, { args: ['tunnel', 'stop'], timeoutMs: 10_000 })
      sendJson(res, result.ok ? 200 : 502, result)
    },
  }))

  disposers.push(host.webServer.register({
    kind: 'exact',
    path: '/dsh-virtuoso/skills',
    handler: async (_req, res) => {
      sendJson(res, 200, { skills: readBundledSkillSummaries() })
    },
  }))

  /**
   * POST /dsh-virtuoso/skills/add
   *
   * Write a user-authored SKILL.md to `$DSH_HOME/skills/<id>/SKILL.md`.
   * The file is auto-discovered by `@deepseek-ai/dsh-skill-filesystem`
   * on the next reload (the provider's `watch: true` default picks up
   * new files in the user skill root).
   *
   * Request body: `{ id, name, description, body, allowedTools? }`.
   * - `id` must match the kebab-case grammar (matches DSH's
   *   `isSkillName`); failing this is a 400.
   * - `name`, `description`, `body` must be non-empty.
   * - `allowedTools` defaults to the standard vcli gate if omitted
   *   (Bash star vcli, Bash star virtuoso, Read, Write, Edit).
   *
   * Refuses to clobber: returns 409 if the target SKILL.md already
   * exists. The user can manually edit the file to update.
   *
   * Response (200): `{ ok: true, path: string, id: string, note: string }`.
   * Response (400): `{ ok: false, errors: UserSkillValidationError[] }`.
   * Response (409): `{ ok: false, error: 'already-exists', path: string }`.
   * Response (500): `{ ok: false, error: 'write-failed', reason: string }`.
   */
  disposers.push(host.webServer.register({
    kind: 'exact',
    path: '/dsh-virtuoso/skills/add',
    handler: async (req, res) => {
      if (!sameOrigin(req)) return sendJson(res, 403, { ok: false, error: 'forbidden' })
      const parsed = await readJsonBody(req)
      if (!parsed.ok) return sendJson(res, 400, { ok: false, error: 'invalid-body', reason: parsed.error })
      const draft = parsed.value as Partial<UserSkillDraft>
      const errors = validateUserSkillDraft({
        id: typeof draft.id === 'string' ? draft.id : '',
        name: typeof draft.name === 'string' ? draft.name : '',
        description: typeof draft.description === 'string' ? draft.description : '',
        body: typeof draft.body === 'string' ? draft.body : '',
        allowedTools: typeof draft.allowedTools === 'string' ? draft.allowedTools : undefined,
      })
      if (errors.length > 0) {
        sendJson(res, 400, { ok: false, errors })
        return
      }
      const targetPath = resolveUserSkillPath(draft.id as string)
      if (existsSync(targetPath)) {
        sendJson(res, 409, { ok: false, error: 'already-exists', path: targetPath })
        return
      }
      try {
        mkdirSync(dirname(targetPath), { recursive: true })
        writeFileSync(targetPath, buildSkillMarkdown({
          id: draft.id as string,
          name: draft.name as string,
          description: draft.description as string,
          body: draft.body as string,
          allowedTools: draft.allowedTools,
        }), 'utf8')
      } catch (err) {
        sendJson(res, 500, { ok: false, error: 'write-failed', reason: (err as Error).message })
        return
      }
      sendJson(res, 200, {
        ok: true,
        path: targetPath,
        id: draft.id,
        note: 'SKILL.md written. Reload dsh web (or wait for the skill-filesystem watcher) to pick it up.',
      })
    },
  }))

  // Surface the loader so the settings card can render the bundle stack
  // — mirrors dsh-market's plugin-snapshot UI without claiming conflict
  // detection; virtuoso is just one community bundle.
  disposers.push(host.webServer.register({
    kind: 'exact',
    path: '/dsh-virtuoso/loader',
    handler: async (_req, res) => {
      const entries: LoaderSummary[] = []
      for (const entry of host.loader.entries()) {
        if (entry.options?.name !== undefined) entries.push({ name: entry.options.name })
      }
      sendJson(res, 200, { entries })
    },
  }))

  host.logger?.info?.(`dsh-virtuoso: mounted ${disposers.length} routes on profile=${resolved.profile}`)

  return () => {
    for (const d of disposers) {
      try { d() } catch { /* ignore disposer failures during teardown */ }
    }
  }
}

/**
 * Project a `VirtuosoCliConfig` to a JSON-safe shape for `/dsh-virtuoso/status`.
 *
 * Excludes nothing but `binaryPath` is omitted (the panel already knows
 * whether `hasBinary` is true). Mirrors dsh-market's `cliSummary` style.
 */
function cliSummary(cli: VirtuosoCliConfig): Record<string, unknown> {
  return {
    hasBinary: cli.hasBinary,
    host: cli.host,
    port: cli.port,
    session: cli.session,
    timeoutSeconds: cli.timeoutSeconds,
    remoteHost: cli.remoteHost,
    isRemote: cli.isRemote,
    jumpHost: cli.jumpHost,
    clientId: cli.clientId,
    cacheDir: cli.cacheDir,
    logDir: cli.logDir,
  }
}
