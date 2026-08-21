/**
 * dsh-virtuoso host entry: registers the plugin on the host cordis context
 * and mounts the HTTP routes once `webServer` and `loader` are available.
 *
 * The host half is intentionally small — most of the plugin's value lives in
 * the bundled virtuoso-cli skills (see `bundled-skill/`) and the light HTTP
 * surface that lets the settings panel introspect the local `vcli` daemon.
 *
 * Both `installVirtuosoSettings` and `mountVirtuosoRoutes` are ctx-needing
 * helpers; they must be called from inside an active inject scope. See
 * `src/settings.ts` for the canonical explanation of why, and
 * `scripts/check-inject-boundary.mjs` for the static check that catches
 * misplaced callers before they reach `dsh web`. The `['webServer',
 * 'loader']` scope chosen here matches the dsh-market host composition
 * and is enough to cover both helpers.
 */

import type { Context } from '@deepseek-ai/cordis'
import { mountVirtuosoRoutes, type VirtuosoConfig, type VirtuosoHost } from './routes.ts'
import { installVirtuosoSettings } from './settings.ts'
import { version } from './version.ts'

export const name = 'dsh-virtuoso'

/** Optional configuration supplied by the loader under `config:`. */
export type Config = Partial<Pick<VirtuosoConfig, 'allowTunnelStart' | 'allowRestart'>>

/** Read the operator's chosen profile name off argv, like dsh-market does. */
function argvProfile(): string | undefined {
  const argv = process.argv
  const flag = argv.indexOf('--profile')
  if (flag !== -1 && flag + 1 < argv.length && !argv[flag + 1].startsWith('-')) return argv[flag + 1]
  return undefined
}

/**
 * Apply the plugin to the host context.
 *
 * The hook waits for `webServer` and `loader` to be present (DSH's ordinary
 * web composition guarantees them on the `web` profile). The settings
 * section rides the same inject scope — the dsh-settings helper itself
 * opens a sub-scope on `['settings']`, so being inside `webServer`/`loader`
 * is sufficient context.
 *
 * @param ctx - Host cordis context.
 * @param config - Loader-supplied config under `config:` in cordis.yml.
 */
export function apply(ctx: Context, config?: Config): void {
  // Build the resolved config up-front — both the routes and the settings
  // hooks share the same object reference, so toggling a setting from the
  // UI writes back into the route's view of the world without a
  // re-mount.
  const resolved: VirtuosoConfig = {
    profile: argvProfile() ?? 'web',
    /** Defaulted to true so the settings panel can surface the toggle even
     * when the loader supplies neither `allowTunnelStart` nor anything in
     * a legacy default. Mirrors dsh-market's "operator said nothing" vs.
     * "operator said yes" distinction (#229). */
    allowTunnelStart: config?.allowTunnelStart ?? true,
    allowRestart: config?.allowRestart,
    version: version(),
  }

  ctx.inject(['webServer', 'loader'], (hostCtx) => {
    const host = hostCtx as unknown as VirtuosoHost

    // Must run inside this inject scope — `installSettingsSection` opens a
    // nested `ctx.inject(['settings'], ...)` and needs the parent scope to
    // be live. See the file-level comment for why this used to crash.
    installVirtuosoSettings(ctx, resolved)

    host.effect(
      () => mountVirtuosoRoutes(host, resolved),
      'dsh-virtuoso: http routes',
    )
  })
}
