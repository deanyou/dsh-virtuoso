/**
 * Helpers for the "Add custom skill" panel feature.
 *
 * Why this exists as a separate module: the route handler in `routes.ts`
 * is wrapped in web-server plumbing (sameOrigin gate, JSON marshalling)
 * that we don't want to drag into unit tests. The pure functions below
 * — validate, build frontmatter, compute the target path — are
 * independently testable and called from the route handler.
 *
 * Storage location: `$DSH_HOME/skills/<id>/SKILL.md`. This is the
 * `USER_DSH_RANK` discovery root documented by `@deepseek-ai/dsh-skill-filesystem`:
 * skills dropped there are auto-discovered once DSH reloads (the
 * filesystem provider's `watch: true` default picks up new files).
 * Survives plugin uninstall — they're the user's, not ours.
 *
 * Trust model: the panel accepts a name, description, and body, and
 * writes a SKILL.md whose frontmatter `allowed-tools:` defaults to the
 * standard vcli gate. The plugin does NOT add custom skills to its own
 * bundled-skill/ directory — that would mix author-time shipping
 * (subject to npm-pack / sandbox checks) with user-time additions
 * (subject to the user's approval and disk writes).
 */
import { homedir } from 'node:os'
import { join } from 'node:path'

/** Skill-name grammar copied from `@deepseek-ai/dsh-skill/lib/index.js`. */
export const SKILL_NAME_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** The standard `allowed-tools:` line we apply to every user-added skill.
 *  Mirrors the gate `scripts/sync-skills.mjs` enforces on bundled skills. */
export const STANDARD_ALLOWED_TOOLS =
  'Bash(*/vcli *) Bash(*/virtuoso *) Read Write Edit'

export interface UserSkillDraft {
  id: string
  name: string
  description: string
  body: string
  allowedTools?: string
}

export interface UserSkillValidationError {
  field: 'id' | 'name' | 'description' | 'body' | 'allowedTools'
  message: string
}

/**
 * Validate a draft. Returns an empty array on success; an array of
 * one-or-more errors otherwise. The caller maps these to a 400 response.
 */
export function validateUserSkillDraft(draft: UserSkillDraft): UserSkillValidationError[] {
  const errors: UserSkillValidationError[] = []
  if (typeof draft.id !== 'string' || !SKILL_NAME_REGEX.test(draft.id)) {
    errors.push({ field: 'id', message: 'id must be kebab-case (^[a-z0-9]+(?:-[a-z0-9]+)*$)' })
  }
  if (typeof draft.name !== 'string' || draft.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'name must be non-empty' })
  }
  if (typeof draft.description !== 'string' || draft.description.trim().length === 0) {
    errors.push({ field: 'description', message: 'description must be non-empty' })
  }
  if (typeof draft.body !== 'string' || draft.body.trim().length === 0) {
    errors.push({ field: 'body', message: 'body must be non-empty' })
  }
  // The user's `allowedTools`, if provided, must be a string. We don't try
  // to parse the gate line — that's the user's call.
  if (draft.allowedTools !== undefined && typeof draft.allowedTools !== 'string') {
    errors.push({ field: 'allowedTools', message: 'allowedTools must be a string when provided' })
  }
  return errors
}

/**
 * Render the YAML frontmatter block. One key per line, no quotes around
 * values — the description can be multi-line `description: |` block, but
 * we keep it single-line here for simplicity. The body follows the
 * closing `---` on its own line.
 */
export function buildSkillMarkdown(draft: UserSkillDraft): string {
  const tools = draft.allowedTools ?? STANDARD_ALLOWED_TOOLS
  const lines: string[] = [
    '---',
    `name: ${draft.name}`,
    `description: ${draft.description}`,
    `allowed-tools: ${tools}`,
    '---',
    '',
  ]
  // Body is appended verbatim after the closing fence. Caller is
  // responsible for ensuring it doesn't accidentally re-open the fence.
  if (draft.body.length > 0) {
    lines.push(draft.body)
    if (!draft.body.endsWith('\n')) lines.push('')
  }
  return lines.join('\n')
}

/**
 * Resolve the target path for a user skill, following DSH's home
 * convention (`$DSH_HOME` if set and non-empty, otherwise `~/.dsh`).
 * Mirrors `resolveDshHome()` in `@deepseek-ai/dsh-home-paths/lib/index.js`
 * — duplicated here (5 lines) rather than pulled in as a direct dep just
 * to read one env var.
 */
export function resolveDshSkillsRoot(env: NodeJS.ProcessEnv = process.env): string {
  const fromEnv = env.DSH_HOME
  const home = (fromEnv !== undefined && fromEnv.trim().length > 0) ? fromEnv : join(homedir(), '.dsh')
  return join(home, 'skills')
}

/**
 * Build the full path to the SKILL.md file. Does not touch the
 * filesystem — pure path arithmetic.
 */
export function resolveUserSkillPath(id: string, env: NodeJS.ProcessEnv = process.env): string {
  return join(resolveDshSkillsRoot(env), id, 'SKILL.md')
}