/**
 * Settings namespace for the plugin.
 *
 * The plugin is conceptually small (it ships skills + daemon health), so
 * only two fields are exposed:
 *
 *   allowTunnelStart  — let the UI suggest `vcli tunnel start` when the
 *                       daemon is not running. Off in air-gapped shops
 *                       where the vcli binary is absent.
 *   allowRestart      — mirrors dsh-market; flips off under systemd / launchd.
 *
 * The schema is registered as a settings section the user can edit at
 * runtime. Updated values are written back to the in-memory `resolved`
 * object the routes read from.
 */

import type { Context } from '@deepseek-ai/cordis'
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings'
import z from '@deepseek-ai/schemastery'
import type { VirtuosoConfig } from './routes.ts'

export const VIRTUOSO_SETTINGS_NS = settingsNamespace('dsh-virtuoso')

/** The subset of virtuoso config a user may edit at runtime. */
export interface VirtuosoSettings {
  allowTunnelStart: boolean
  allowRestart: boolean
}

export const VirtuosoSettings: z<VirtuosoSettings> = z.object({
  allowTunnelStart: z.boolean().default(true),
  allowRestart: z.boolean().default(true),
})

/**
 * Install the virtuoso settings namespace on the host context.
 *
 * No-ops cleanly on hosts without a settings service (older DSH versions)
 * because `installSettingsSection` runs the registration through a scoped
 * fiber and the hooks only fire if the service appears. We test for
 * `ctx.settings` presence here for the same reason dsh-market does — see
 * its `installMarketSettings` for the matching rationale.
 *
 * @param ctx - Host cordis context.
 * @param resolved - The live config object; updated in place on toggle.
 */
export function installVirtuosoSettings(ctx: Context, resolved: VirtuosoConfig): void {
  const settings = (ctx as unknown as { settings?: unknown }).settings
  if (settings === undefined) return
  const entry: VirtuosoSettings = {
    allowTunnelStart: resolved.allowTunnelStart ?? true,
    // Mirrors dsh-market's `restartAllowed`: leave undefined when the host
    // owner hasn't expressed a preference, so a future supervisor-detector
    // can distinguish "operator said nothing" from "operator said no".
    allowRestart: resolved.allowRestart ?? true,
  }
  let source = (): VirtuosoSettings => entry
  installSettingsSection(
    ctx,
    VIRTUOSO_SETTINGS_NS,
    VirtuosoSettings,
    entry,
    {
      setSource: (current) => { source = current },
      onChange: () => {
        const next = source()
        resolved.allowTunnelStart = next.allowTunnelStart
        resolved.allowRestart = next.allowRestart
      },
    },
  )
}
