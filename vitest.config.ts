/**
 * Vitest configuration for the dsh-virtuoso plugin.
 *
 * Scope: unit tests for host-side pure functions (config parsing, vcli
 * timeout/version extraction, HTTP helpers, skill frontmatter parser).
 * The client (TSX) is not unit-tested; it goes through the build and
 * typecheck pipeline instead. Tests live in `tests/*.test.ts` and run via
 * `npm test` (this file).
 */
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // Tests are pure-function, so parallelism is fine; each test isolates
    // its own env via `beforeEach` mutation of `process.env`.
    pool: 'threads',
    poolOptions: {
      threads: { singleThread: false },
    },
    // The plugin's host TS imports `@deepseek-ai/cordis` types only;
    // vitest doesn't need to resolve the runtime. Skip DSH-specific
    // peer-dependency resolution to keep tests fast.
    deps: {
      interopDefault: true,
    },
  },
})