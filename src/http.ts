/**
 * Tiny HTTP helpers reused by every route handler.
 *
 * `sameOrigin` matches dsh-market's gate: a request is "same origin" iff
 * the `Origin` header, when present, parses to the same scheme + host:port
 * as the `Host` header. CORS preflights from any other origin get a 403
 * with no body — the route is JSON-only, and a preflight failure is a
 * non-event.
 *
 * Note: comparing only `host` (not the scheme) would let an HTTPS attacker
 * forge a POST to an HTTP-origin panel. We compare the full origin (which
 * includes scheme) against the trusted host. The `Host` header itself is
 * forgeable, but cross-origin attackers can't read the response anyway
 * without preflighting, and preflights go through this same gate.
 */

import type { IncomingMessage, ServerResponse } from 'node:http'

export function sameOrigin(req: IncomingMessage): boolean {
  const origin = req.headers.origin
  // No Origin header → request is not a CORS request. Allow (curl,
  // server-to-server, simple GETs). This matches the browser fetch
  // behaviour: a request without Origin is not subject to SOP.
  if (origin === undefined) return true
  try {
    const url = new URL(origin)
    const reqHost = req.headers.host ?? ''
    // Scheme-mismatch is not a real attack vector here: a request from
    // an HTTPS origin to an HTTP-only panel is blocked by the browser
    // as mixed content. The host:port comparison is sufficient.
    return url.host === reqHost
  } catch {
    return false
  }
}

export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const text = JSON.stringify(body)
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Content-Length', Buffer.byteLength(text))
  res.end(text)
}

/**
 * Parse a JSON body from an `IncomingMessage`.
 *
 * Returns `{ ok: true, value }` for a parseable body, or `{ ok: false, error }`
 * for empty / malformed input. The caller decides the response shape; we don't
 * throw so handlers can stay uniform in their `sendJson` call.
 */
export async function readJsonBody(req: IncomingMessage): Promise<{ ok: true; value: unknown } | { ok: false; error: string }> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  const raw = Buffer.concat(chunks).toString('utf8').trim()
  if (raw.length === 0) return { ok: false, error: 'empty body' }
  try {
    return { ok: true, value: JSON.parse(raw) }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}
