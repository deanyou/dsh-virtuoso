/**
 * The Virtuoso settings section: tabs over the host routes, with refresh
 * polling for status and one-click tunnel/ping buttons. Plain presentation
 * — no host mutations beyond toggling the `Bash` skill at runtime via the
 *   agent, which is out of scope here (settings panel only).
 */
import { createElement as h, useCallback, useEffect, useMemo, useState } from 'react'
import {
  Button,
  IconCheckOutline16,
  IconCopyOutline16,
  IconLoadingOutline16,
  IconRefreshOutline14,
  IconRefreshOutline16,
  IconWarningOutline16,
  StateDot,
  DisclosureRow,
  Tooltip,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { BundledSkillSummary, Translate, VirtuosoStatus, VcliCallOutcome } from './market-data.ts'

type Tab = 'status' | 'skills' | 'install'
type TunnelPhase = 'idle' | 'starting' | 'stopping' | 'ok' | 'fail'
type PingPhase = 'idle' | 'pinging' | 'ok' | 'fail'

export interface VirtuosoSectionProps { t: Translate }

export function VirtuosoSection(props: VirtuosoSectionProps) {
  const t = props.t
  const [tab, setTab] = useState<Tab>('status')
  const [status, setStatus] = useState<VirtuosoStatus | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [tunnel, setTunnel] = useState<TunnelPhase>('idle')
  const [ping, setPing] = useState<PingPhase>('idle')
  const [tunnelOutcome, setTunnelOutcome] = useState<VcliCallOutcome | null>(null)
  const [pingOutcome, setPingOutcome] = useState<VcliCallOutcome | null>(null)
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')

  const refresh = useCallback(async () => {
    setStatusError(null)
    try {
      const r = await fetch('/dsh-virtuoso/status', { credentials: 'same-origin' })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = (await r.json()) as VirtuosoStatus
      setStatus(data)
    } catch (err) {
      setStatusError((err as Error).message)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const tunnelStart = useCallback(async () => {
    if (status !== null && status.allowTunnelStart === false) {
      setTunnel('fail')
      setTunnelOutcome({ ok: false, stdout: '', stderr: 'allowTunnelStart=false', durationMs: 0, code: 403, reason: 'forbidden' })
      return
    }
    setTunnel('starting')
    try {
      const r = await fetch('/dsh-virtuoso/tunnel/start', { method: 'POST', credentials: 'same-origin' })
      const outcome = (await r.json()) as VcliCallOutcome
      setTunnelOutcome(outcome)
      setTunnel(outcome.ok ? 'ok' : 'fail')
      void refresh()
    } catch (err) {
      setTunnel('fail')
      setTunnelOutcome({ ok: false, stdout: '', stderr: (err as Error).message, durationMs: 0, code: null, reason: 'exit' })
    }
  }, [status, refresh])

  const tunnelStop = useCallback(async () => {
    setTunnel('stopping')
    try {
      const r = await fetch('/dsh-virtuoso/tunnel/stop', { method: 'POST', credentials: 'same-origin' })
      const outcome = (await r.json()) as VcliCallOutcome
      setTunnelOutcome(outcome)
      setTunnel(outcome.ok ? 'ok' : 'fail')
      void refresh()
    } catch (err) {
      setTunnel('fail')
      setTunnelOutcome({ ok: false, stdout: '', stderr: (err as Error).message, durationMs: 0, code: null, reason: 'exit' })
    }
  }, [refresh])

  const runPing = useCallback(async () => {
    setPing('pinging')
    try {
      const r = await fetch('/dsh-virtuoso/ping', { method: 'POST', credentials: 'same-origin' })
      const outcome = (await r.json()) as VcliCallOutcome
      setPingOutcome(outcome)
      setPing(outcome.ok ? 'ok' : 'fail')
    } catch (err) {
      setPing('fail')
      setPingOutcome({ ok: false, stdout: '', stderr: (err as Error).message, durationMs: 0, code: null, reason: 'exit' })
    }
  }, [])

  const tabs = useMemo(() => [
    { id: 'status' as const, label: t('tabStatus') },
    { id: 'skills' as const, label: t('tabSkills') },
    { id: 'install' as const, label: t('tabInstall') },
  ], [t])

  const copyCommand = useCallback(async (text: string) => {
    try {
      await navigator.clipboard?.writeText(text)
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 1_500)
    } catch { /* clipboard denied — leave UI untouched */ }
  }, [])

  return (
    <div>
      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      {tab === 'status' && (
        <StatusTab
          t={t}
          status={status}
          error={statusError}
          tunnelPhase={tunnel}
          tunnelOutcome={tunnelOutcome}
          pingPhase={ping}
          pingOutcome={pingOutcome}
          onTunnelStart={tunnelStart}
          onTunnelStop={tunnelStop}
          onPing={runPing}
          onRefresh={() => void refresh()}
        />
      )}
      {tab === 'skills' && (
        <SkillsTab t={t} status={status} />
      )}
      {tab === 'install' && (
        <InstallTab t={t} onCopy={copyCommand} copyState={copyState} />
      )}
    </div>
  )
}

function Tabs(props: { tabs: { id: Tab; label: string }[]; active: Tab; onChange: (id: Tab) => void }) {
  return (
    <div style={tabsContainerStyle}>
      {props.tabs.map((tab) => (
        <button
          type="button"
          key={tab.id}
          aria-pressed={props.active === tab.id}
          onClick={() => props.onChange(tab.id)}
          style={{
            ...tabButtonStyle,
            ...(props.active === tab.id ? tabButtonActiveStyle : null),
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

const tabsContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  borderBottom: '1px solid var(--dsh-color-divider, rgba(127,127,127,0.2))',
  marginBottom: 16,
}

const tabButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  padding: '8px 12px',
  cursor: 'pointer',
  font: 'inherit',
  color: 'var(--dsh-color-text-secondary, #888)',
}

const tabButtonActiveStyle: React.CSSProperties = {
  color: 'var(--dsh-color-text-primary, #fff)',
  borderBottom: '2px solid var(--dsh-color-accent, #4f8ef7)',
  marginBottom: -1,
}

function StatusTab(props: {
  t: Translate
  status: VirtuosoStatus | null
  error: string | null
  tunnelPhase: TunnelPhase
  tunnelOutcome: VcliCallOutcome | null
  pingPhase: PingPhase
  pingOutcome: VcliCallOutcome | null
  onTunnelStart: () => void
  onTunnelStop: () => void
  onPing: () => void
  onRefresh: () => void
}) {
  const { t, status } = props
  if (status === null && props.error === null) {
    return <Panel><StateDot state="ongoing" /> loading…</Panel>
  }
  if (props.error !== null) {
    return (
      <Panel>
        <IconWarningOutline16 size={14} /> {t('fail')}: {props.error}{' '}
        <Button variant="ghost" onClick={props.onRefresh}>{t('retry')}</Button>
      </Panel>
    )
  }
  if (status === null) return null
  const tunnelDisabled = status.allowTunnelStart === false
  return (
    <Panel>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>{t('statusTitle')}</h3>
        <Tooltip label={t('refresh')} side="bottom">
          <Button variant="ghost" icon={<IconRefreshOutline14 size={14} />} onClick={props.onRefresh} />
        </Tooltip>
      </div>
      <Row label={t('statusBinary')} value={
        status.cli.hasBinary
          ? <><IconCheckOutline16 size={14} /> {t('statusBinaryYes')}</>
          : <><IconWarningOutline16 size={14} /> {t('statusBinaryNo')}</>
      } />
      {!status.cli.hasBinary && <Hint text={t('statusBinaryHint')} />}
      <h4 style={sectionHeadingStyle}>{t('statusConfig')}</h4>
      <Row label={t('statusProfile')} value={<code>{status.profile}</code>} />
      <Row label={t('statusHost')} value={<code>{status.cli.host}</code>} />
      <Row label={t('statusPort')} value={<code>{status.cli.port}</code>} />
      <Row label={t('statusSession')} value={<code>{status.cli.session ?? t('empty')}</code>} />
      <Row label={t('statusRemote')} value={<code>{status.cli.remoteHost}</code>} />
      <Row label={t('statusJump')} value={<code>{status.cli.jumpHost ?? t('empty')}</code>} />
      <Row label={t('statusTimeout')} value={<code>{status.cli.timeoutSeconds}s</code>} />
      <Row label={t('statusCache')} value={<code>{status.cli.cacheDir}</code>} />
      <Row label={t('statusLog')} value={<code>{status.cli.logDir}</code>} />
      <h4 style={sectionHeadingStyle}>tunnel / daemon</h4>
      {tunnelDisabled && <Hint text={t('tunnelDisabledHint')} />}
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="primary" disabled={tunnelDisabled || props.tunnelPhase === 'starting' || props.tunnelPhase === 'stopping'} onClick={props.onTunnelStart} icon={props.tunnelPhase === 'starting' ? <IconLoadingOutline16 size={14} /> : undefined}>
          {t('tunnelStart')}
        </Button>
        <Button variant="outline" disabled={!status.cli.hasBinary || props.tunnelPhase === 'starting' || props.tunnelPhase === 'stopping'} onClick={props.onTunnelStop} icon={props.tunnelPhase === 'stopping' ? <IconLoadingOutline16 size={14} /> : undefined}>
          {t('tunnelStop')}
        </Button>
        <Button variant="outline" disabled={!status.cli.hasBinary || props.pingPhase === 'pinging'} onClick={props.onPing} icon={props.pingPhase === 'pinging' ? <IconLoadingOutline16 size={14} /> : <IconRefreshOutline16 size={14} />}>
          {t('tunnelStatus')}
        </Button>
      </div>
      {props.tunnelOutcome !== null && (
        <CallResult label="tunnel" outcome={props.tunnelOutcome} okLabel={t('tunnelStarted')} failLabel={t('fail')} />
      )}
      {props.pingOutcome !== null && (
        <CallResult label="ping" outcome={props.pingOutcome} okLabel={t('tunnelPing')} failLabel={t('tunnelPingFailed')} />
      )}
    </Panel>
  )
}

function SkillsTab(props: { t: Translate; status: VirtuosoStatus | null }) {
  const { t, status } = props
  if (status === null) return <Panel><StateDot state="ongoing" /></Panel>
  return (
    <Panel>
      <h3 style={{ margin: 0 }}>{t('skillsTitle')}</h3>
      <Hint text={t('skillsHint')} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {status.skills.map((s) => <SkillRow key={s.id} skill={s} parsedLabel={t('skillsParsed')} brokenLabel={t('skillsBroken')} bytesLabel={t('skillsBytes')} />)}
        {status.skills.length === 0 && <Hint text={t('empty')} />}
      </div>
    </Panel>
  )
}

function SkillRow(props: { skill: BundledSkillSummary; parsedLabel: string; brokenLabel: string; bytesLabel: string }) {
  const [open, setOpen] = useState(false)
  const s = props.skill
  const title = `${s.name} — ${s.parsed ? props.parsedLabel : props.brokenLabel} · ${s.bytes} ${props.bytesLabel}`
  return (
    <DisclosureRow
      icon={<StateDot state={s.parsed ? 'done' : 'warning'} size={8} />}
      title={title}
      open={open}
      expandable
      onToggle={() => setOpen(o => !o)}
    >
      <p style={{ whiteSpace: 'pre-wrap', margin: 0, color: 'var(--dsh-color-text-secondary, #888)' }}>{s.description}</p>
    </DisclosureRow>
  )
}

function InstallTab(props: { t: Translate; onCopy: (text: string) => void; copyState: 'idle' | 'copied' }) {
  const t = props.t
  return (
    <Panel>
      <h3 style={{ margin: 0 }}>{t('installTitle')}</h3>
      <Section title={t('installFromCrates')}>
        <CodeBlock text={t('installFromCratesCommand')} onCopy={props.onCopy} copyState={props.copyState} copyLabel={t('copy')} copiedLabel={t('copied')} />
      </Section>
      <Section title={t('installFromSource')}>
        <CodeBlock text={t('installFromSourceCommand')} onCopy={props.onCopy} copyState={props.copyState} copyLabel={t('copy')} copiedLabel={t('copied')} />
      </Section>
      <Section title={t('installLoadBridge')}>
        <Hint text={t('installLoadBridgeHint')} />
        <CodeBlock text={t('installLoadBridgeCommand')} onCopy={props.onCopy} copyState={props.copyState} copyLabel={t('copy')} copiedLabel={t('copied')} />
      </Section>
    </Panel>
  )
}

function CodeBlock(props: { text: string; onCopy: (text: string) => void; copyState: 'idle' | 'copied'; copyLabel: string; copiedLabel: string }) {
  return (
    <div style={codeBlockStyle}>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', flex: 1 }}>{props.text}</pre>
      <Button variant="ghost" onClick={() => props.onCopy(props.text)} icon={<IconCopyOutline16 size={14} />}>
        {props.copyState === 'copied' ? props.copiedLabel : props.copyLabel}
      </Button>
    </div>
  )
}

function Panel(props: { children: React.ReactNode }) {
  return <div style={panelStyle}>{props.children}</div>
}

function Row(props: { label: string; value: React.ReactNode }) {
  return (
    <div style={rowStyle}>
      <span style={rowLabelStyle}>{props.label}</span>
      <span style={rowValueStyle}>{props.value}</span>
    </div>
  )
}

function Hint(props: { text: string }) {
  return <p style={hintStyle}>{props.text}</p>
}

function Section(props: { title: string; children: React.ReactNode }) {
  return (
    <div style={sectionStyle}>
      <h4 style={sectionHeadingStyle}>{props.title}</h4>
      {props.children}
    </div>
  )
}

function CallResult(props: { label: string; outcome: VcliCallOutcome; okLabel: string; failLabel: string }) {
  return (
    <pre style={callResultStyle}>
      [{props.label}] {props.outcome.ok ? props.okLabel : props.failLabel}
      {'\n'}exit={String(props.outcome.code)} reason={String(props.outcome.reason ?? '-')} duration={String(props.outcome.durationMs)}ms
      {props.outcome.stderr && `\nstderr: ${props.outcome.stderr}`}
    </pre>
  )
}

const panelStyle: React.CSSProperties = { padding: 16 }
const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: '1px dashed var(--dsh-color-divider, rgba(127,127,127,0.15))' }
const rowLabelStyle: React.CSSProperties = { width: 200, color: 'var(--dsh-color-text-secondary, #888)' }
const rowValueStyle: React.CSSProperties = { flex: 1, fontFamily: 'ui-monospace, SFMono-Regular, monospace' }
const hintStyle: React.CSSProperties = { color: 'var(--dsh-color-text-secondary, #888)', fontSize: 13, margin: '4px 0 8px' }
const sectionStyle: React.CSSProperties = { marginTop: 12 }
const sectionHeadingStyle: React.CSSProperties = { fontSize: 13, color: 'var(--dsh-color-text-tertiary, #999)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '16px 0 8px' }
const codeBlockStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, background: 'var(--dsh-color-code-bg, rgba(127,127,127,0.08))', padding: 8, borderRadius: 4 }
const callResultStyle: React.CSSProperties = { ...codeBlockStyle, whiteSpace: 'pre-wrap', marginTop: 8 }
