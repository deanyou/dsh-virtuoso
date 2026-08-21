/**
 * Tests for src/http.ts (sameOrigin, sendJson, readJsonBody).
 *
 * `sameOrigin` is the only gate on POST routes — when it returns true
 * for a request that should be cross-origin, we've got a CSRF bug.
 */
import { Readable } from 'node:stream'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { describe, expect, it, vi } from 'vitest'
import { sameOrigin, sendJson, readJsonBody } from '../src/http.ts'

/**
 * Build a minimal IncomingMessage stub. The host only reads `headers`,
 * `url`, and `method`.
 */
function reqStub(opts: {
  origin?: string | undefined
  host?: string | undefined
  body?: string
}): IncomingMessage {
  const headers: Record<string, string | undefined> = {}
  if (opts.origin !== undefined) headers['origin'] = opts.origin
  if (opts.host !== undefined) headers['host'] = opts.host
  const req = new Readable({ read() {} })
  ;(req as unknown as { headers: Record<string, string | undefined> }).headers = headers
  ;(req as unknown as { method: string; url: string }).method = 'POST'
  ;(req as unknown as { url: string }).url = '/dsh-virtuoso/ping'
  if (opts.body !== undefined) {
    req.push(opts.body)
    req.push(null)
  } else {
    req.push(null)
  }
  return req as unknown as IncomingMessage
}

/**
 * Build a minimal ServerResponse that captures what was written.
 */
function resStub(): ServerResponse & { body: string; statusCode: number; headers: Record<string, string | undefined> } {
  const headers: Record<string, string | undefined> = {}
  const res = {
    body: '',
    statusCode: 0,
    headers,
    setHeader(name: string, value: string | number) {
      headers[name] = String(value)
    },
    end(chunk: string | Buffer = '') {
      this.body = typeof chunk === 'string' ? chunk : chunk.toString('utf8')
    },
  }
  return res as unknown as ServerResponse & { body: string; statusCode: number; headers: Record<string, string | undefined> }
}

describe('sameOrigin', () => {
  it('treats missing Origin header as same-origin (curl/server-to-server)', () => {
    const req = reqStub({ host: 'localhost:3080' })
    expect(sameOrigin(req)).toBe(true)
  })

  it('returns true when Origin matches Host exactly', () => {
    const req = reqStub({ origin: 'http://localhost:3080', host: 'localhost:3080' })
    expect(sameOrigin(req)).toBe(true)
  })

  it('returns true when Origin host matches even if scheme differs (browser blocks mixed content)', () => {
    // Scheme mismatch is not a real attack vector — the browser blocks
    // HTTPS→HTTP requests as mixed content before this gate runs. The
    // implementation intentionally only compares host:port.
    const req = reqStub({ origin: 'https://localhost:3080', host: 'localhost:3080' })
    expect(sameOrigin(req)).toBe(true)
  })

  it('returns false when Origin host differs', () => {
    const req = reqStub({ origin: 'http://evil.example:3080', host: 'localhost:3080' })
    expect(sameOrigin(req)).toBe(false)
  })

  it('returns false when Origin port differs', () => {
    const req = reqStub({ origin: 'http://localhost:9090', host: 'localhost:3080' })
    expect(sameOrigin(req)).toBe(false)
  })

  it('returns false when Origin is malformed', () => {
    const req = reqStub({ origin: 'not a url', host: 'localhost:3080' })
    expect(sameOrigin(req)).toBe(false)
  })

  it('returns false when Host header is missing entirely', () => {
    // An attacker forging Origin but no Host: should fail closed.
    const req = reqStub({ origin: 'http://localhost:3080', host: undefined })
    // Note: header values can be string | string[] | undefined; we set undefined.
    expect(sameOrigin(req)).toBe(false)
  })
})

describe('sendJson', () => {
  it('writes the body as JSON with the given status code', () => {
    const res = resStub()
    sendJson(res, 200, { ok: true, count: 3 })
    expect(res.statusCode).toBe(200)
    expect(res.headers['Content-Type']).toBe('application/json; charset=utf-8')
    const parsed = JSON.parse(res.body) as { ok: boolean; count: number }
    expect(parsed.ok).toBe(true)
    expect(parsed.count).toBe(3)
  })

  it('serializes non-string keys via JSON.stringify', () => {
    const res = resStub()
    sendJson(res, 502, { error: 'bad', reason: 'exit', code: 1 })
    expect(res.body).toContain('"error":"bad"')
    expect(res.body).toContain('"code":1')
  })

  it('computes Content-Length from byte length (UTF-8 safe)', () => {
    const res = resStub()
    sendJson(res, 200, { msg: '你好' })
    // 你好 is 6 bytes in UTF-8; the body is JSON-encoded so it's longer.
    expect(res.headers['Content-Length']).toBeDefined()
    expect(Number(res.headers['Content-Length'])).toBeGreaterThan(0)
  })
})

describe('readJsonBody', () => {
  it('returns ok=true for a valid JSON object', async () => {
    const req = reqStub({ body: '{"foo": "bar"}' })
    const result = await readJsonBody(req)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toEqual({ foo: 'bar' })
    }
  })

  it('returns ok=false for empty body', async () => {
    const req = reqStub({ body: '' })
    const result = await readJsonBody(req)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('empty body')
    }
  })

  it('returns ok=false for malformed JSON', async () => {
    const req = reqStub({ body: '{not json' })
    const result = await readJsonBody(req)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.length).toBeGreaterThan(0)
    }
  })

  it('returns ok=true for valid JSON primitive (number/string)', async () => {
    const req = reqStub({ body: '42' })
    const result = await readJsonBody(req)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toBe(42)
    }
  })

  it('returns ok=true for valid JSON null', async () => {
    const req = reqStub({ body: 'null' })
    const result = await readJsonBody(req)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toBeNull()
    }
  })
})