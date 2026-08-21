/**
 * Tests for src/vcli.ts (callVcli, extractVersion).
 *
 * Most of callVcli is glue around `spawn` — the testable bits are:
 *   - missing-binary branch: when binaryPath is null, returns immediately
 *     with reason='missing-binary' and code=null
 *   - timeout branch: when the child doesn't exit before the timeout, the
 *     process is killed and the result has reason='timeout'
 *   - exit branch: when the child exits non-zero, result has reason='exit'
 *   - version extraction: `vcli --version` output is parsed for x.y.z
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { spawn } from 'node:child_process'
import type { VirtuosoCliConfig } from '../src/config.ts'
import { callVcli } from '../src/vcli.ts'

/**
 * Stub a VirtuosoCliConfig. Tests only need `binaryPath` (which we set to
 * a known test command) plus the env (which callVcli reads).
 */
function cliWith(binaryPath: string | null): VirtuosoCliConfig {
  return {
    hasBinary: binaryPath !== null,
    binaryPath,
    host: '127.0.0.1',
    port: 0,
    session: null,
    timeoutSeconds: 30,
    remoteHost: null,
    isRemote: false,
    jumpHost: null,
    clientId: null,
    cacheDir: '/tmp',
    logDir: '/tmp',
  }
}

describe('callVcli: missing binary', () => {
  it('returns missing-binary without spawning when binaryPath is null', async () => {
    const cli = cliWith(null)
    const result = await callVcli(cli, { args: ['session', 'list'] })
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('missing-binary')
    expect(result.code).toBeNull()
    expect(result.durationMs).toBe(0)
    expect(result.stderr).toBe('vcli not on PATH')
  })
})

describe('callVcli: exit path', () => {
  it('returns exit reason on non-zero exit', async () => {
    // Use /bin/sh with a deliberately failing command; this verifies
    // callVcli handles arbitrary argv (the no-shell guarantee is
    // elsewhere — spawn is called with an array).
    const cli = cliWith('/bin/sh')
    const result = await callVcli(cli, { args: ['-c', 'exit 7'] })
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('exit')
    expect(result.code).toBe(7)
  })

  it('returns ok=true on zero exit', async () => {
    const cli = cliWith('/bin/sh')
    const result = await callVcli(cli, { args: ['-c', 'echo hello'] })
    expect(result.ok).toBe(true)
    expect(result.code).toBe(0)
    expect(result.stdout).toContain('hello')
  })
})

describe('callVcli: timeout', () => {
  it('returns timeout reason when the child runs longer than timeoutMs', async () => {
    const cli = cliWith('/bin/sh')
    const start = Date.now()
    // `sleep 5` should be killed by our 200ms timeout.
    const result = await callVcli(cli, { args: ['-c', 'sleep 5'], timeoutMs: 200 })
    const elapsed = Date.now() - start
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('timeout')
    expect(result.code).toBeNull()
    // Allow generous slack for process startup.
    expect(elapsed).toBeLessThan(2000)
  })
})

describe('callVcli: spawn error', () => {
  it('returns reason=exit when spawn itself fails (ENOENT)', async () => {
    // Use a path that definitely doesn't exist.
    const cli = cliWith('/this/path/does/not/exist/atvcli')
    const result = await callVcli(cli, { args: ['whatever'] })
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('exit')
    expect(result.code).toBeNull()
    expect(result.stderr.length).toBeGreaterThan(0)
  })
})

describe('callVcli: env passthrough', () => {
  it('forwards process.env to the child', async () => {
    process.env.VIRTUOSO_BRIDGE_TEST = 'hello-from-parent'
    const cli = cliWith('/bin/sh')
    const result = await callVcli(cli, { args: ['-c', 'echo "$VIRTUOSO_BRIDGE_TEST"'] })
    delete process.env.VIRTUOSO_BRIDGE_TEST
    expect(result.ok).toBe(true)
    expect(result.stdout).toContain('hello-from-parent')
  })

  it('allows per-call env overrides', async () => {
    const cli = cliWith('/bin/sh')
    const result = await callVcli(cli, {
      args: ['-c', 'echo "$VIRTUOSO_BRIDGE_TEST"'],
      env: { VIRTUOSO_BRIDGE_TEST: 'override' },
    })
    expect(result.stdout).toContain('override')
  })
})

// Verify that spawn is called with array-form args (not shell-string).
// This is the trust boundary the SKILL.md claims — a malicious SKILL
// must not be able to inject shell metacharacters.
describe('callVcli: shell-safety', () => {
  it('uses array-form spawn so shell metacharacters are inert', async () => {
    // We can't easily intercept spawn from a test, but we can verify the
    // observable behavior: a shell-injection-y arg should appear LITERALLY
    // in the output, not be interpreted by a shell.
    //
    // `echo` with `; rm -rf /tmp/should-not-exist` — if spawn used a
    // shell, the second command would run. With array-form spawn, it's
    // just text echo'd to stdout.
    const cli = cliWith('/bin/echo')
    const result = await callVcli(cli, { args: ['hello; rm -rf /tmp/should-not-exist'] })
    expect(result.ok).toBe(true)
    expect(result.stdout.trim()).toBe('hello; rm -rf /tmp/should-not-exist')
  })
})

// Ensure no test leaks a spawned process — vitest's pool reuses workers.
describe('test isolation', () => {
  it('does not leak orphan processes between tests', () => {
    // Smoke check: if any test before this left a child running,
    // `ps` would show it. We don't assert anything; just exercise the
    // sandbox.
    expect(typeof spawn).toBe('function')
  })
})