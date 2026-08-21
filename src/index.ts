/**
 * dsh-virtuoso host entry: registers the plugin on the host cordis context
 * and mounts the HTTP routes once `webServer` and `loader` are available.
 *
 * The host half is intentionally small — most of the plugin's value lives in
 * the bundled virtuoso-cli skills (see `bundled-skill/`) and the light HTTP
 * surface that lets the settings panel introspect the local `vcli` daemon.
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
 * web composition guarantees them on the `web` profile). For testing
 * environments without a web server we still install the settings namespace,
 * so the configuration page works against an unconfigured plugin.
 *
 * @param ctx - Host cordis context.
 * @param config - Loader-supplied config under `config:` in cordis.yml.
 */
export function apply(ctx: Context, config?: Config): void {
  const resolved: VirtuosoConfig = {
    profile: argvProfile() ?? 'web',
    /** Filled in once `webServer` is available — defaulted to true so the
     * settings panel can surface the toggle before any host injection runs. */
    allowTunnelStart: config?.allowTunnelStart ?? true,
    allowRestart: config?.allowRestart,
    version: version(),
  }

  // The settings namespace is always installable (it is a no-op on hosts
  // without a settings service; see src/settings.ts).
  installVirtuosoSettings(ctx, resolved)

  ctx.inject(['webServer', 'loader'], (hostCtx) => {
    const host = hostCtx as unknown as VirtuosoHost
    host.effect(
      () => mountVirtuosoRoutes(host, resolved),
      'dsh-virtuoso: http routes',
    )
  })
}
