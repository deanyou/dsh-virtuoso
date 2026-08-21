/**
 * Thin wrapper around the external `vcli` binary — the Rust daemon exposed
 * by `cargo install virtuoso-cli`.
 *
 * Most of the plugin's value is in the bundled skills (they invoke `vcli`
 * themselves via `Bash`); the host half only needs three things out of
 * process: presence check, version probe, and tunnel/status readout.
 *
 * All exec calls:
 *   - use array-form `spawn` (NEVER a shell) so a malicious SKILL can't inject
 *     arguments via a quote, mirroring virtuoso-cli `client.rs::cmd_secure`.
 *   - apply a soft timeout to defend against a stuck daemon wedging the panel.
 *   - return a discriminated result so callers do not have to inspect stderr
 *     strings — this matches vcli's own `VirtuosoResult { ok, skill_ok }`.
 */

import { spawn } from 'node:child_process'
import type { VirtuosoCliConfig } from './config.ts'

export interface VcliCallResult {
  ok: boolean
  stdout: string
  stderr: string
  durationMs: number
  code: number | null
  /** 'missing-binary' | 'timeout' | 'exit' when ok===false; undefined otherwise. */
  reason?: 'missing-binary' | 'timeout' | 'exit'
  /** Filled in only when the call printed a recognizable version banner. */
  version?: string
}

const DEFAULT_TIMEOUT_MS = 5_000

interface CallOptions {
  args: readonly string[]
  /** Hard timeout in ms; defaults to 5 s. Longer calls go through the
   * settings panel's own progress UI rather than blocking the panel. */
  timeoutMs?: number
  /** Optional env overrides; absent keys fall through to process.env. */
  env?: Record<string, string>
}

/**
 * Run `vcli <args...>` once and capture stdout/stderr.
 *
 * The returned shape is uniform whether the binary is missing, the call
 * times out, or it exits non-zero — so a settings panel can render the same
 * status row either way and only the `reason` / `code` differ.
 */
export async function callVcli(config: VirtuosoCliConfig, opts: CallOptions): Promise<VcliCallResult> {
  if (config.binaryPath === null) {
    return { ok: false, stdout: '', stderr: 'vcli not on PATH', durationMs: 0, code: null, reason: 'missing-binary' }
  }
  const start = Date.now()
  return await new Promise<VcliCallResult>((resolve) => {
    const child = spawn(config.binaryPath as string, opts.args, {
      env: { ...process.env, ...(opts.env ?? {}) },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    let settled = false
    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      child.kill('SIGTERM')
      resolve({ ok: false, stdout: '', stderr: stderr || `timeout after ${opts.timeoutMs ?? DEFAULT_TIMEOUT_MS}ms`, durationMs: Date.now() - start, code: null, reason: 'timeout' })
    }, opts.timeoutMs ?? DEFAULT_TIMEOUT_MS)
    child.stdout?.on('data', (chunk: Buffer) => { stdout += chunk.toString('utf8') })
    child.stderr?.on('data', (chunk: Buffer) => { stderr += chunk.toString('utf8') })
    child.on('close', (code) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve({
        ok: code === 0,
        stdout,
        stderr,
        durationMs: Date.now() - start,
        code,
        version: code === 0 ? extractVersion(stdout) : undefined,
        reason: code === 0 ? undefined : ('exit' as const),
      })
    })
    child.on('error', (err) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve({ ok: false, stdout: '', stderr: err.message, durationMs: Date.now() - start, code: null, reason: 'exit' })
    })
  })
}

/**
 * Extract a `version x.y.z` line from `vcli --version` output.
 *
 * vcli prints `virtuoso-cli 0.4.0-alpha.7` (release builds) or
 * `virtuoso-cli 0.4.0-alpha.7 (commit abc1234)` (debug builds). We match
 * the second token so both shapes parse.
 */
function extractVersion(stdout: string): string | undefined {
  const line = stdout.trim().split('\n')[0] ?? ''
  const match = /\S+\s+(\S+)/.exec(line)
  return match?.[1]
}
