/**
 * Tests for src/skills.ts (parseFrontmatter, readBundledSkillSummaries).
 *
 * `parseFrontmatter` is exported indirectly (private). We test it via the
 * `readBundledSkillSummaries` reading the actual bundled-skill/ tree, and
 * via inline fixtures placed under tests/fixtures/.
 */
import { describe, expect, it } from 'vitest'
import { readBundledSkillSummaries } from '../src/skills.ts'

describe('readBundledSkillSummaries', () => {
  it('lists all 18 bundled skills', () => {
    const skills = readBundledSkillSummaries()
    expect(skills.length).toBe(18)
  })

  it('every skill has parsed=true (frontmatter gate present)', () => {
    // This is the regression test for the silent `allowed-tools:` gap we
    // just fixed. A skill that ships without frontmatter (or with
    // malformed frontmatter) would have parsed=false here.
    const skills = readBundledSkillSummaries()
    const unparsed = skills.filter((s) => !s.parsed)
    expect(unparsed).toEqual([])
  })

  it('every skill has a non-empty description', () => {
    const skills = readBundledSkillSummaries()
    for (const s of skills) {
      expect(s.description.length).toBeGreaterThan(0)
    }
  })

  it('returns skills sorted by id', () => {
    const skills = readBundledSkillSummaries()
    const ids = skills.map((s) => s.id)
    const sorted = [...ids].sort()
    expect(ids).toEqual(sorted)
  })

  it('every skill id is a single-segment directory name', () => {
    // Skill ids are also used as filenames in the agent's tool set;
    // a slash or space would break the tool binding.
    const skills = readBundledSkillSummaries()
    for (const s of skills) {
      expect(s.id).toMatch(/^[a-z0-9_-]+$/)
    }
  })
})