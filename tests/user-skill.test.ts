/**
 * Tests for src/user-skill.ts (validateUserSkillDraft,
 * buildSkillMarkdown, resolveDshSkillsRoot, resolveUserSkillPath).
 *
 * These cover the pure-function pieces of the "Add user-level skill"
 * feature. The route handler (POST /dsh-virtuoso/skills/add) is
 * exercised via integration tests; here we focus on the building
 * blocks.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  SKILL_NAME_REGEX,
  STANDARD_ALLOWED_TOOLS,
  buildSkillMarkdown,
  resolveDshSkillsRoot,
  resolveUserSkillPath,
  validateUserSkillDraft,
  type UserSkillDraft,
} from '../src/user-skill.ts'

const ENV_KEYS = ['DSH_HOME', 'HOME', 'USERPROFILE'] as const
let saved: Record<string, string | undefined> = {}

beforeEach(() => {
  for (const k of ENV_KEYS) saved[k] = process.env[k]
  delete process.env.DSH_HOME
})
afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k]
    else process.env[k] = saved[k]
  }
})

const goodDraft: UserSkillDraft = {
  id: 'my-skill',
  name: 'My Skill',
  description: 'Does things.',
  body: '# body\n\nUse this skill to do things.',
}

describe('SKILL_NAME_REGEX', () => {
  it('accepts simple kebab-case names', () => {
    expect(SKILL_NAME_REGEX.test('my-skill')).toBe(true)
    expect(SKILL_NAME_REGEX.test('foo')).toBe(true)
    expect(SKILL_NAME_REGEX.test('a-b-c-d')).toBe(true)
    expect(SKILL_NAME_REGEX.test('skill-123')).toBe(true)
  })

  it('rejects names with uppercase, underscores, or leading/trailing hyphens', () => {
    expect(SKILL_NAME_REGEX.test('MySkill')).toBe(false)
    expect(SKILL_NAME_REGEX.test('my_skill')).toBe(false)
    expect(SKILL_NAME_REGEX.test('-leading')).toBe(false)
    expect(SKILL_NAME_REGEX.test('trailing-')).toBe(false)
    expect(SKILL_NAME_REGEX.test('double--hyphen')).toBe(false)
    expect(SKILL_NAME_REGEX.test('')).toBe(false)
    expect(SKILL_NAME_REGEX.test('with space')).toBe(false)
    expect(SKILL_NAME_REGEX.test('with.dot')).toBe(false)
  })
})

describe('validateUserSkillDraft', () => {
  it('returns no errors for a well-formed draft', () => {
    expect(validateUserSkillDraft(goodDraft)).toEqual([])
  })

  it('flags empty id', () => {
    const errors = validateUserSkillDraft({ ...goodDraft, id: '' })
    expect(errors.some((e) => e.field === 'id')).toBe(true)
  })

  it('flags non-kebab-case id', () => {
    const errors = validateUserSkillDraft({ ...goodDraft, id: 'Bad_Id' })
    expect(errors.some((e) => e.field === 'id')).toBe(true)
  })

  it('flags empty name', () => {
    const errors = validateUserSkillDraft({ ...goodDraft, name: '' })
    expect(errors.some((e) => e.field === 'name')).toBe(true)
  })

  it('flags whitespace-only name (after trim)', () => {
    const errors = validateUserSkillDraft({ ...goodDraft, name: '   ' })
    expect(errors.some((e) => e.field === 'name')).toBe(true)
  })

  it('flags empty description', () => {
    const errors = validateUserSkillDraft({ ...goodDraft, description: '' })
    expect(errors.some((e) => e.field === 'description')).toBe(true)
  })

  it('flags empty body', () => {
    const errors = validateUserSkillDraft({ ...goodDraft, body: '' })
    expect(errors.some((e) => e.field === 'body')).toBe(true)
  })

  it('flags non-string allowedTools', () => {
    // The TypeScript type is string|undefined; the runtime check guards
    // against a misbehaving caller (e.g. an over-zealous fetcher that
    // sends `allowedTools: ["Bash(...)"]`).
    const errors = validateUserSkillDraft({
      ...goodDraft,
      allowedTools: ['Bash(*/vcli *)'] as unknown as string,
    })
    expect(errors.some((e) => e.field === 'allowedTools')).toBe(true)
  })

  it('accumulates multiple errors (does not stop at the first)', () => {
    const errors = validateUserSkillDraft({
      id: '',
      name: '',
      description: '',
      body: '',
    })
    // Four fields are bad — at least four errors should be returned.
    expect(errors.length).toBeGreaterThanOrEqual(4)
  })
})

describe('buildSkillMarkdown', () => {
  it('emits a valid YAML frontmatter block', () => {
    const md = buildSkillMarkdown(goodDraft)
    expect(md.startsWith('---\n')).toBe(true)
    // Find the closing fence; the second `---` should end the frontmatter.
    const closingIdx = md.indexOf('\n---\n', 4)
    expect(closingIdx).toBeGreaterThan(0)
  })

  it('puts the body after the closing fence', () => {
    const md = buildSkillMarkdown(goodDraft)
    const fenceEnd = md.indexOf('\n---\n', 4) + 5
    const tail = md.slice(fenceEnd)
    expect(tail).toContain(goodDraft.body)
  })

  it('uses the standard vcli gate when allowedTools is omitted', () => {
    const md = buildSkillMarkdown(goodDraft)
    expect(md).toContain(`allowed-tools: ${STANDARD_ALLOWED_TOOLS}`)
  })

  it('honours a custom allowedTools line', () => {
    const md = buildSkillMarkdown({ ...goodDraft, allowedTools: 'Bash(*/vcli *) Read' })
    expect(md).toContain('allowed-tools: Bash(*/vcli *) Read')
    expect(md).not.toContain(STANDARD_ALLOWED_TOOLS)
  })

  it('emits a trailing newline so the body sits on its own paragraph', () => {
    const md = buildSkillMarkdown({ ...goodDraft, body: 'short body' })
    // After the closing fence, there should be a blank line then the body.
    expect(md).toMatch(/\n---\n\nshort body\n?$/)
  })

  it('does not double-terminate a body that already has a trailing newline', () => {
    const md = buildSkillMarkdown({ ...goodDraft, body: 'short body\n' })
    // Body already ends with \n; buildSkillMarkdown should not add a
    // second \n.
    expect(md.endsWith('short body\n')).toBe(true)
    expect(md.endsWith('short body\n\n')).toBe(false)
  })
})

describe('resolveDshSkillsRoot', () => {
  it('uses $DSH_HOME when set and non-empty', () => {
    process.env.DSH_HOME = '/custom/dsh/home'
    expect(resolveDshSkillsRoot()).toBe('/custom/dsh/home/skills')
  })

  it('treats whitespace-only $DSH_HOME as unset', () => {
    process.env.DSH_HOME = '   '
    // Falls back to $HOME/.dsh/skills
    expect(resolveDshSkillsRoot()).toMatch(/\.dsh[\\/]skills$/)
  })

  it('falls back to $HOME/.dsh when DSH_HOME is unset', () => {
    delete process.env.DSH_HOME
    expect(resolveDshSkillsRoot()).toMatch(/\.dsh[\\/]skills$/)
  })

  it('returns the skills subdirectory of the resolved home', () => {
    expect(resolveDshSkillsRoot()).toMatch(/[\\/]skills$/)
  })
})

describe('resolveUserSkillPath', () => {
  it('joins the skills root with the id and SKILL.md', () => {
    process.env.DSH_HOME = '/home/user1/.dsh'
    expect(resolveUserSkillPath('my-skill')).toBe('/home/user1/.dsh/skills/my-skill/SKILL.md')
  })

  it('does not sanitize the id — validation is the caller\'s responsibility', () => {
    // If the id is malformed, resolveUserSkillPath just composes the
    // path; it's validateUserSkillDraft that catches it. The
    // composition is correct.
    process.env.DSH_HOME = '/home/user1/.dsh'
    expect(resolveUserSkillPath('Bad_Id')).toBe('/home/user1/.dsh/skills/Bad_Id/SKILL.md')
  })
})