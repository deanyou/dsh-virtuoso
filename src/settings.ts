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
 *
 * Service-access boundary: dsh-settings' `installSettingsSection` itself
 * calls `ctx.inject(['settings'], ...)` internally, so it tolerates being
 * invoked from outside an active inject scope. **But we still have to be
 * inside some inject scope** (e.g. the `['webServer', 'loader']` scope we
 * open in `src/index.ts`) — the cordis sandbox used by dsh-cordis-host-runner
 * rejects `ctx.settings` access from the bare apply() entry because settings
 * is not in the inject tree of the un-scoped context. Calling this from
 * outside that inject would crash with "cannot get property 'settings'
 * without inject" (issue #2). The host entry in `src/index.ts` therefore
 * invokes `installVirtuosoSettings` from inside the inject callback — see
 * that file for the constraint.
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
 * Install the virtuoso settings namespace.
 *
 * The function re-attaches on every inject unload (dsh-settings' built-in
 * `effect(() => () => ...)` cleanup disposes the section), so this is
 * safe to call once per host startup. Hosts without a `settings` service
 * have `installSettingsSection` no-op cleanly because its internal
 * `ctx.inject(['settings'], ...)` is a leaf node: if `settings` is absent
 * from the composition, the inner callback never runs and no namespace
 * is registered. We therefore need **no** settings-presence guard of our
 * own — the earlier hand-written `ctx.settings` probe was both redundant
 * and the cause of the boot crash.
 *
 * @param ctx - Host cordis context (must be inside an active inject scope).
 * @param resolved - The live config object; updated in place on toggle.
 */
export function installVirtuosoSettings(ctx: Context, resolved: VirtuosoConfig): void {
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
      // Assigns ONLY what this namespace owns. Writing back a field the
      // plugin stores elsewhere is how a setting loses its memory.
      onChange: () => {
        const next = source()
        resolved.allowTunnelStart = next.allowTunnelStart
        resolved.allowRestart = next.allowRestart
      },
    },
  )
}
