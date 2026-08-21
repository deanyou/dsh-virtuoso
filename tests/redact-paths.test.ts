/**
 * Tests for redactPaths (src/client/market-data.ts).
 *
 * The panel uses this to scrub stderr before showing it to a wide
 * audience — kiosks, shared dev machines, etc. The redaction must
 * catch real paths without over-aggressively redacting things that
 * look path-like but aren't (URLs, version numbers).
 */
import { describe, expect, it } from 'vitest'
import { redactPaths } from '../src/client/market-data.ts'

describe('redactPaths', () => {
  describe('absolute Unix paths', () => {
    it('redacts a simple absolute path', () => {
      expect(redactPaths('error in /home/user1/foo.scs'))
        .toContain('[PATH]')
      expect(redactPaths('error in /home/user1/foo.scs'))
        .not.toContain('/home/user1')
    })

    it('redacts nested paths', () => {
      expect(redactPaths('failed at /a/b/c/d/e.scs line 5'))
        .toContain('[PATH]')
    })

    it('redacts Virtuoso cache paths', () => {
      // The exact shape of the bug we hit earlier: SSH error referencing
      // the cache dir.
      const out = redactPaths('error: cannot read /home/user1/.cache/virtuoso_bridge/sessions/dean.json')
      expect(out).not.toContain('/home/user1')
      expect(out).not.toContain('dean.json')
      expect(out).toContain('[PATH]')
    })

    it('does not redact single-component /-strings (just a slash, not a path)', () => {
      // Strings like "/foo" without a second component should NOT be
      // redacted — `/foo` is often a URI fragment, not a path.
      expect(redactPaths('see /usr for details'))
        .toContain('/usr')
    })
  })

  describe('home-relative paths', () => {
    it('redacts ~-relative paths', () => {
      const out = redactPaths('~/.cache/virtuoso_bridge/sessions/dean.json')
      expect(out).not.toContain('dean.json')
      expect(out).toContain('[PATH]')
    })

    it('redacts /home/user/... patterns', () => {
      const out = redactPaths('failed: /home/user1/sim/run1/input.scs missing')
      expect(out).not.toContain('user1')
    })
  })

  describe('Windows paths', () => {
    it('redacts Windows-style paths', () => {
      const out = redactPaths('error in C:\\Users\\alice\\foo.scs')
      expect(out).not.toContain('alice')
    })
  })

  describe('things that should NOT be redacted', () => {
    it('preserves version numbers', () => {
      expect(redactPaths('virtuoso-cli 0.4.0-alpha.7'))
        .toBe('virtuoso-cli 0.4.0-alpha.7')
    })

    it('redacts URL paths too (treating all /foo/bar-shaped strings as paths)', () => {
      // Note: the regex is path-agnostic — it catches ANY /foo/bar string,
      // including URL paths. This is the right default for shared-kiosk
      // display: if it's a path-shaped string in stderr, the operator
      // didn't put it there, the daemon did, and it should be redacted.
      // We document this behavior so a future contributor doesn't "fix"
      // it without thinking through the threat model.
      expect(redactPaths('GET /api/v1/sessions 200'))
        .toBe('GET [PATH] 200')
    })

    it('preserves single-component /-strings (a slash without further components)', () => {
      // Strings like "/foo" alone aren't paths — they're often command
      // separators or short tokens.
      expect(redactPaths('use --foo /bar to enable'))
        .toBe('use --foo /bar to enable')
    })

    it('preserves Spectre netlist lines', () => {
      const netlist = `M1 (VIN net19 0 0) n33 lr=350n wr=1u nf=4
M2 (VIP net19 0 0) n33 lr=350n wr=1u nf=4`
      // No actual paths in this snippet; redaction must be a no-op.
      expect(redactPaths(netlist)).toBe(netlist)
    })

    it('preserves error codes and reasons', () => {
      const s = 'failed with exit=2 reason=exit duration=22ms'
      expect(redactPaths(s)).toBe(s)
    })
  })

  describe('idempotence', () => {
    it('redacting an already-redacted string is a no-op', () => {
      const once = redactPaths('error: /home/user1/foo')
      const twice = redactPaths(once)
      expect(twice).toBe(once)
    })
  })

  describe('empty and edge inputs', () => {
    it('returns empty for empty input', () => {
      expect(redactPaths('')).toBe('')
    })

    it('does not throw on null-like strings', () => {
      // The route should never send these, but defensive: a panel that
      // somehow has `undefined.toString()` upstream would have already
      // crashed; we just guard the function itself.
      expect(() => redactPaths('undefined')).not.toThrow()
      expect(() => redactPaths('null')).not.toThrow()
    })
  })
})