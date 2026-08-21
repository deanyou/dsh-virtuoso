/**
 * The plugin's card on the plugin configuration page (DSH rc.7+).
 *
 * It manages the plugin itself — version, status, quick link to the
 * section. The card's scope is deliberately narrow: this page is where a
 * user goes to deal with a plugin, and "is it installed, what version, go
 * open it" is the only thing anybody can act on without knowing how DSH
 * is put together.
 *
 * Mirrors dsh-market's SettingsCard structure: header row → DisclosureRow
 * → body. We don't ship a removal flow because the user's cordis.yml is
 * the authoritative source; this is a visibility card, not a mutator.
 */

import { createElement as h, useCallback, useEffect, useState } from 'react'
import {
  Button,
  DisclosureRow,
  IconLoadingOutline16,
  IconRefreshOutline14,
  StateDot,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { Translate, VirtuosoStatus } from './market-data.ts'

export interface SettingsCardProps {
  t: Translate
  /** Called when the plugin is removed; the parent retires our settings entry. */
  onRemoved?: () => void
}

export function SettingsCard(props: SettingsCardProps) {
  const t = props.t
  const [status, setStatus] = useState<VirtuosoStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const r = await fetch('/dsh-virtuoso/status', { credentials: 'same-origin' })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = (await r.json()) as VirtuosoStatus
      setStatus(data)
    } catch (err) {
      setError((err as Error).message)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const title = `dsh-virtuoso${status !== null ? ` v${status.pluginVersion}` : ''}`

  return (
    <DisclosureRow
      icon={<StateDot state={stateFor(status)} size={8} />}
      title={title}
      open={open}
      expandable
      onToggle={() => setOpen(o => !o)}
    >
      <div style={{ padding: 8 }}>
        <p style={{ margin: '0 0 8px', color: 'var(--dsh-color-text-secondary, #888)' }}>{t('setCardDesc')}</p>
        {error !== null && <p style={{ color: 'var(--dsh-color-warning, #c97)' }}>{t('fail')}: {error}</p>}
        {status === null && <IconLoadingOutline16 size={14} />}
        {status !== null && (
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            <li>vcli binary: {status.cli.hasBinary ? t('statusBinaryYes') : t('statusBinaryNo')}</li>
            <li>{t('statusRemote')}: <code>{status.cli.remoteHost ?? t('empty')}</code></li>
            <li>{t('statusProfile')}: <code>{status.profile}</code></li>
            <li>bundled skills: <code>{status.skills.length}</code></li>
          </ul>
        )}
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <Button variant="ghost" onClick={() => void refresh()} icon={<IconRefreshOutline14 size={14} />}>
            {t('refresh')}
          </Button>
        </div>
      </div>
    </DisclosureRow>
  )
}

function stateFor(status: VirtuosoStatus | null): 'ongoing' | 'done' | 'warning' {
  if (status === null) return 'ongoing'
  return status.cli.hasBinary ? 'done' : 'warning'
}
