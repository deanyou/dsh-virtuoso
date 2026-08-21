/**
 * HTTP routes bridging the browser settings panel to the host.
 *
 * The plugin keeps its surface tiny — only what the settings panel needs:
 *
 *   GET  /dsh-virtuoso/status        — version, binary presence, config dump
 *   POST /dsh-virtuoso/ping          — call `vcli session show` once
 *   POST /dsh-virtuoso/tunnel/start  — call `vcli tunnel start`
 *   POST /dsh-virtuoso/tunnel/stop   — call `vcli tunnel stop`
 *   GET  /dsh-virtuoso/skills        — list bundled skill names + descriptions
 *
 * All post routes accept same-origin only and same-rule: same as dsh-market.
 * Every route returns JSON; the client UI consumes them via fetch.
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import { readVirtuosoCliConfig } from './config.ts'
import { readBundledSkillSummaries } from './skills.ts'
import { callVcli } from './vcli.ts'
import { sendJson, sameOrigin } from './http.ts'
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
      const result = await callVcli(cli, { args: ['session', 'show', '--format', 'json'], timeoutMs: 4_000 })
      sendJson(res, result.ok ? 200 : 502, result)
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
    jumpHost: cli.jumpHost,
    clientId: cli.clientId,
    cacheDir: cli.cacheDir,
    logDir: cli.logDir,
  }
}
