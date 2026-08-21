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
import type { BundledSkillSummary, Translate, VirtuosoSessionInfo, VirtuosoSessions, VirtuosoStatus, VcliCallOutcome } from './market-data.ts'
import { redactPaths } from './market-data.ts'

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
  const [sessions, setSessions] = useState<VirtuosoSessions | null>(null)
  const [sessionsError, setSessionsError] = useState<string | null>(null)
  const [current, setCurrent] = useState<{ session: string; port: number; autoSelected: boolean } | null>(null)
  const [currentError, setCurrentError] = useState<string | null>(null)
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  // Auto-refresh toggle. When true and the user is on the status tab,
  // the panel re-fetches every 30s so a long-running session sees the
  // current daemon state without manual refresh. Off by default — the
  // panel is conservative; the user opts in.
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false)

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

  // Fetch the active Virtuoso sessions once on mount. Re-fetched only when
    // the user clicks refresh — the panel doesn't poll this; the daemon
    // process list is stable across a session and polling every render
    // would re-run `vcli session list` on every state change.
  const loadSessions = useCallback(async () => {
    setSessionsError(null)
    try {
      const r = await fetch('/dsh-virtuoso/sessions', { credentials: 'same-origin' })
      if (!r.ok) {
        const fallback = await r.json().catch(() => null) as { error?: string } | null
        throw new Error(fallback?.error ?? `HTTP ${r.status}`)
      }
      const data = (await r.json()) as VirtuosoSessions
      setSessions(data)
    } catch (err) {
      setSessionsError((err as Error).message)
    }
  }, [])

  // Fetch which session auto-routing would pick. Distinct from `sessions`
    // (the full list) — `current` is the "where will the next skill exec
    // land?" answer. Re-fetched alongside `sessions` on every refresh.
  const loadCurrent = useCallback(async () => {
    setCurrentError(null)
    try {
      const r = await fetch('/dsh-virtuoso/session-current', { credentials: 'same-origin' })
      if (!r.ok) {
        const fallback = await r.json().catch(() => null) as { error?: string } | null
        throw new Error(fallback?.error ?? `HTTP ${r.status}`)
      }
      const data = (await r.json()) as {
        session: string | null
        port: number | null
        auto_selected?: boolean
        status: 'success' | 'error'
        error?: string
      }
      if (data.status === 'error' || data.session === null) {
        setCurrent(null)
      } else {
        setCurrent({ session: data.session, port: data.port ?? 0, autoSelected: data.auto_selected ?? true })
      }
    } catch (err) {
      setCurrentError((err as Error).message)
      setCurrent(null)
    }
  }, [])

  // Single refresh that hits all three endpoints in parallel. The host
    // returns from the binary cache (30 s TTL) so the cost of these three
    // fetches is one `findVcliOnPath` call plus three `vcli session ...`
    // subprocesses — about 30 ms total on a warm daemon.
  const refreshAll = useCallback(async () => {
    await Promise.all([refresh(), loadSessions(), loadCurrent()])
  }, [refresh, loadSessions, loadCurrent])

  useEffect(() => { void refreshAll() }, [refreshAll])

  // Auto-refresh interval: only fires when on the status tab AND the
  // user has explicitly toggled auto-refresh on. The status tab is the
  // only place the daemon state is displayed; polling the skills/install
  // tabs would be wasteful. Clearing the interval on unmount prevents
  // leaks when the user closes the settings panel.
  useEffect(() => {
    if (!autoRefresh || tab !== 'status') return
    const id = window.setInterval(() => { void refreshAll() }, 30_000)
    return () => { window.clearInterval(id) }
  }, [autoRefresh, tab, refreshAll])

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
      void refreshAll()
    } catch (err) {
      setTunnel('fail')
      setTunnelOutcome({ ok: false, stdout: '', stderr: (err as Error).message, durationMs: 0, code: null, reason: 'exit' })
    }
  }, [status, refreshAll])

  const tunnelStop = useCallback(async () => {
    setTunnel('stopping')
    try {
      const r = await fetch('/dsh-virtuoso/tunnel/stop', { method: 'POST', credentials: 'same-origin' })
      const outcome = (await r.json()) as VcliCallOutcome
      setTunnelOutcome(outcome)
      setTunnel(outcome.ok ? 'ok' : 'fail')
      void refreshAll()
    } catch (err) {
      setTunnel('fail')
      setTunnelOutcome({ ok: false, stdout: '', stderr: (err as Error).message, durationMs: 0, code: null, reason: 'exit' })
    }
  }, [refreshAll])

  const runPing = useCallback(async () => {
    setPing('pinging')
    try {
      const r = await fetch('/dsh-virtuoso/ping', { method: 'POST', credentials: 'same-origin' })
      const outcome = (await r.json()) as VcliCallOutcome
      setPingOutcome(outcome)
      setPing(outcome.ok ? 'ok' : 'fail')
      void refreshAll()
    } catch (err) {
      setPing('fail')
      setPingOutcome({ ok: false, stdout: '', stderr: (err as Error).message, durationMs: 0, code: null, reason: 'exit' })
    }
  }, [refreshAll])

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
          sessions={sessions}
          sessionsError={sessionsError}
          current={current}
          currentError={currentError}
          autoRefresh={autoRefresh}
          onTunnelStart={tunnelStart}
          onTunnelStop={tunnelStop}
          onPing={runPing}
          onRefresh={() => void refreshAll()}
          onToggleAutoRefresh={() => setAutoRefresh((v) => !v)}
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
  sessions: VirtuosoSessions | null
  sessionsError: string | null
  current: { session: string; port: number; autoSelected: boolean } | null
  currentError: string | null
  autoRefresh: boolean
  onTunnelStart: () => void
  onTunnelStop: () => void
  onPing: () => void
  onRefresh: () => void
  onToggleAutoRefresh: () => void
}) {
  const { t, status } = props
  if (status === null && props.error === null) {
    return <Panel><StateDot state="ongoing" /> {t('loading')}</Panel>
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
  // Local mode = no remote host. The Start tunnel button would otherwise
  // shell out to `vcli tunnel start`, which always tries to SSH and fails
  // on an empty hostname. The server route short-circuits this case, but
  // the UI should also show the local/remote distinction so the operator
  // understands why the button isn't doing what the label implies.
  const isLocal = status.cli.isRemote === false
  return (
    <Panel>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>{t('statusTitle')}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Tooltip label={props.autoRefresh ? t('autoRefreshOn') : t('autoRefreshOff')} side="bottom">
            <Button
              variant={props.autoRefresh ? 'primary' : 'ghost'}
              onClick={props.onToggleAutoRefresh}
              size="sm"
            >
              {props.autoRefresh ? '⏱ 30s' : '⏱ off'}
            </Button>
          </Tooltip>
          <Tooltip label={t('refresh')} side="bottom">
            <Button variant="ghost" icon={<IconRefreshOutline14 size={14} />} onClick={props.onRefresh} />
          </Tooltip>
        </div>
      </div>
      <Row label={t('statusBinary')} value={
        status.cli.hasBinary
          ? <><IconCheckOutline16 size={14} /> {t('statusBinaryYes')}</>
          : <><IconWarningOutline16 size={14} /> {t('statusBinaryNo')}</>
      } />
      {!status.cli.hasBinary && <Hint text={t('statusBinaryHint')} />}
      <Hint text={t('statusEnvHint')} />
      <h4 style={sectionHeadingStyle}>{t('statusConfig')}</h4>
      <Row label={t('statusProfile')} value={<code>{status.profile}</code>} />
      <Row label={t('statusHost')} value={<code>{status.cli.host}</code>} />
      <Row label={t('statusPort')} value={<code>{status.cli.port}</code>} />
      <Row label={t('statusSession')} value={<code>{status.cli.session ?? t('empty')}</code>} />
      <Row label={t('statusRemote')} value={<code>{status.cli.remoteHost ?? t('empty')}</code>} />
      <Row label={t('statusJump')} value={<code>{status.cli.jumpHost ?? t('empty')}</code>} />
      <Row label={t('statusTimeout')} value={<code>{status.cli.timeoutSeconds}s</code>} />
      <Row label={t('statusCache')} value={<code>{status.cli.cacheDir}</code>} />
      <Row label={t('statusLog')} value={<code>{status.cli.logDir}</code>} />
      <h4 style={sectionHeadingStyle}>{t('sessionsTitle')}</h4>
      {props.sessions === null && props.sessionsError === null && (
        <Hint text={t('sessionsLoading')} />
      )}
      {props.sessionsError !== null && (
        <Hint text={`${t('fail')}: ${props.sessionsError}`} />
      )}
      {props.sessions !== null && props.sessions.sessions.length === 0 && (
        <Hint text={t('sessionsEmpty')} />
      )}
      {props.sessions !== null && props.sessions.sessions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {props.sessions.sessions.map((s, idx) => (
            <SessionRow
              key={s.id ?? `s${idx}`}
              session={s}
              currentId={props.current?.session ?? null}
              labels={{
                port: t('sessionPort'),
                host: t('sessionHost'),
                user: t('sessionUser'),
                started: t('sessionCreated'),
                active: t('sessionActive'),
              }}
            />
          ))}
        </div>
      )}
      {props.current !== null && (
        <Hint text={`${t('sessionCurrent')}: ${props.current.session} (port ${props.current.port})`} />
      )}
      {props.currentError !== null && (
        <Hint text={`${t('sessionCurrentError')}: ${props.currentError}`} />
      )}
      <h4 style={sectionHeadingStyle}>{t('tunnelSection')}</h4>
      {tunnelDisabled && <Hint text={t('tunnelDisabledHint')} />}
      {isLocal && <Hint text={t('tunnelLocalHint')} />}
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="primary" disabled={tunnelDisabled || isLocal || props.tunnelPhase === 'starting' || props.tunnelPhase === 'stopping'} onClick={props.onTunnelStart} icon={props.tunnelPhase === 'starting' ? <IconLoadingOutline16 size={14} /> : undefined}>
          {t('tunnelStart')}
        </Button>
        <Button variant="outline" disabled={isLocal || !status.cli.hasBinary || props.tunnelPhase === 'starting' || props.tunnelPhase === 'stopping'} onClick={props.onTunnelStop} icon={props.tunnelPhase === 'stopping' ? <IconLoadingOutline16 size={14} /> : undefined}>
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

/**
 * One row in the "Connected Virtuoso" section. The session id is the
 * canonical handle the user passes to vcli with `--session`; the port is
 * what the local daemon is listening on (the bridge daemon listens on
 * each Virtuoso instance's port, not VB_PORT).
 *
 * The row is intentionally flat (not collapsible): the four fields are
 * short and the user benefits from seeing all the session metadata at a
 * glance. The `currentId` flag adds a "● active" marker when this is the
 * session that `vcli session current` would auto-select — useful when
 * multiple Virtuoso instances are running and the user wants to know
 * which one the next `vcli skill exec` will land on.
 */
function SessionRow(props: {
  session: VirtuosoSessionInfo
  currentId: string | null
  labels: { port: string; host: string; user: string; started: string; active: string }
}) {
  const s = props.session
  const isCurrent = props.currentId !== null && s.id !== undefined && props.currentId === s.id
  const title = s.id !== undefined
    ? (isCurrent ? `● ${s.id} — ${props.labels.active}` : s.id)
    : '?'
  const titleColor = isCurrent
    ? 'var(--dsh-color-accent, #4f8ef7)'
    : 'var(--dsh-color-text-primary, #fff)'
  return (
    <div style={{
      padding: '6px 8px',
      borderLeft: `2px solid ${isCurrent ? 'var(--dsh-color-accent, #4f8ef7)' : 'transparent'}`,
      background: 'var(--dsh-color-code-bg, rgba(127,127,127,0.04))',
      borderRadius: 3,
    }}>
      <div style={{ fontWeight: 600, color: titleColor }}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', fontSize: 12, color: 'var(--dsh-color-text-secondary, #888)', marginTop: 2 }}>
        {s.port !== undefined && <span>{props.labels.port}: <code>{s.port}</code></span>}
        {s.host !== undefined && <span>{props.labels.host}: <code>{s.host}</code></span>}
        {s.user !== undefined && <span>{props.labels.user}: <code>{s.user}</code></span>}
        {s.created !== undefined && <span>{props.labels.started}: <code>{s.created}</code></span>}
      </div>
    </div>
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
  // Redact filesystem paths from stderr before display. The raw stderr
  // is still on the wire (the route returns it), so an operator with
  // curl/devtools can still see the full string — but the panel
  // surfaces a sanitized form by default. The `note` field is shown
  // verbatim because it's authored by the route, not arbitrary vcli
  // output.
  const stderrDisplay = props.outcome.stderr ? redactPaths(props.outcome.stderr) : ''
  return (
    <div>
      <pre style={callResultStyle}>
        [{props.label}] {props.outcome.ok ? props.okLabel : props.failLabel}
        {'\n'}exit={String(props.outcome.code)} reason={String(props.outcome.reason ?? '-')} duration={String(props.outcome.durationMs)}ms
        {stderrDisplay && `\nstderr: ${stderrDisplay}`}
      </pre>
      {props.outcome.note !== undefined && props.outcome.note !== '' && (
        <p style={noteStyle}>{props.outcome.note}</p>
      )}
    </div>
  )
}

const noteStyle: React.CSSProperties = {
  margin: '4px 0 0',
  padding: '4px 8px',
  borderLeft: '2px solid var(--dsh-color-accent, #4f8ef7)',
  color: 'var(--dsh-color-text-secondary, #888)',
  fontSize: 12,
  background: 'var(--dsh-color-code-bg, rgba(127,127,127,0.04))',
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
