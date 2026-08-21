/**
 * dsh-virtuoso client: registers a "Virtuoso" settings section rendering the
 * bundled-skill listing, the local `vcli` daemon health, and the tunnel
 * control buttons. The runtime shape is identical to dsh-market's client
 * entry: localize → slot inject → nested `slots.inject(settings.plugin.item)`.
 *
 * Built by tsdown into `client/client.js`; the only externals are react
 * and the @deepseek-ai/dsh-client-ui-primitives, both resolved from the
 * loader module table at runtime.
 */
import { createElement as h } from 'react'
import * as primitives from '@deepseek-ai/dsh-client-ui-primitives'
import { en, zh } from './locales.ts'
import { VirtuosoSection } from './VirtuosoSection.tsx'
import { SettingsCard } from './SettingsCard.tsx'
import type { Translate } from './market-data.ts'

const NS = 'dsh-virtuoso'

/**
 * Primitives this bundle relies on. Mirrors the dsh-market `REQUIRED_PRIMITIVES`
 * gate: on a host older than rc.6 the resolver returns undefined for these
 * named exports and rendering would throw. Returning the gaps lets apply()
 * skip registration for a clean downgrade rather than blanking the dialog.
 */
export const REQUIRED_PRIMITIVES = ['Button', 'DisclosureRow', 'Tooltip', 'Toast', 'StateDot'] as const

export function missingPrimitives(mod: Record<string, unknown>, required: readonly string[] = REQUIRED_PRIMITIVES): string[] {
  return required.filter(name => mod[name] === undefined)
}

/** The subset of the theme service this plugin touches. */
interface ThemeService {
  getTheme(): unknown
  setTheme(id: string): void
}

/** The subset of the locale service this plugin touches. */
interface LocaleService {
  register(namespace: string, dicts: { zh: Record<string, string>; en: Record<string, string> }): unknown
  bind(namespace: string): Translate
  subscribe(callback: () => void): () => void
  getSnapshot(): { active: string }
}

/** The subset of the slots service this plugin touches. */
interface SlotsService {
  inject(slot: string, register: () => unknown): void
  register(meta: Record<string, unknown>, component: () => unknown): unknown
}

interface VirtuosoClientContext {
  effect(callback: () => unknown, label?: string): void
  on(event: string, callback: () => void): () => void
  locale: LocaleService
  slots: SlotsService
  theme: ThemeService
}

interface SettingsScopeHost {
  slots: {
    inject(name: string, register: () => unknown): void
    register(options: Record<string, unknown>, render: () => unknown): unknown
  }
}

export const name = 'dsh-virtuoso'
export const inject = ['slots', 'locale', 'theme']
export function apply(ctx: VirtuosoClientContext): void {
  // Skip registration if the host's primitives module lacks the rc.6 exports
  // this plugin renders with — mirrors the dsh-market downgrade path.
  const gaps = missingPrimitives(primitives as unknown as Record<string, unknown>)
  if (gaps.length > 0) {
    console.warn('[dsh-virtuoso] host ui-primitives missing ' + gaps.join(', ') + ' — virtuoso section disabled (dsh web >= 0.1.0-rc.6 required)')
    return
  }

  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-virtuoso: dictionaries')
  const t = ctx.locale.bind(NS)

  let retireSection: (() => void) | null = null

  ctx.slots.inject('settings.section', () => {
    const off = ctx.slots.register({
      name: 'settings.section',
      id: 'virtuoso',
      order: 50,
      label: () => t('nav'),
      locale: NS,
      inject: () => ({ t }),
    }, () => h(VirtuosoSection, { t }))
    if (typeof off === 'function') retireSection = off as () => void
    return off
  })

  const settingsCtx = ctx as unknown as {
    inject(services: string[], callback: (scoped: SettingsScopeHost) => void): void
  }
  settingsCtx.inject(['settingsScope'], (scoped) => {
    scoped.slots.inject('settings.plugin.item', () => scoped.slots.register({
      name: 'settings.plugin.item',
      key: NS,
      locale: NS,
      inject: () => ({ t }),
    }, () => h(SettingsCard, { t, onRemoved: () => { const off = retireSection; retireSection = null; off?.() } })))
  })
}
