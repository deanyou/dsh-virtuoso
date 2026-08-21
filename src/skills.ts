/**
 * Read the bundled `bundled-skill/<name>/SKILL.md` tree that ships with the
 * plugin and produce summaries the routes and settings UI consume.
 *
 * DSH's `dsh-skill-filesystem` provider scans `bundledSkillDir` automatically
 * once we point `dsh.bundle.skill` at this directory (see package.json).
 * This module is the host-side mirror of that scan — used by the
 * `/dsh-virtuoso/skills` route and the settings panel's diagnostics card so
 * the user can see what's available without leaving the UI.
 *
 * Each SKILL.md has YAML frontmatter (`---`-fenced) followed by Markdown.
 * We extract `name` and the first line of `description`. Anything missing
 * the fence is reported as `unparsed` rather than silently dropped — the
 * user installed a bundle expecting all 18 skills to be visible.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

export interface BundledSkillSummary {
  /** The directory name under bundled-skill/ — also the skill id. */
  id: string
  /** Frontmatter `name:` if set, else directory name. */
  name: string
  /** First non-empty line of frontmatter `description:` (trimmed). */
  description: string
  /** Whether the SKILL.md was parseable. */
  parsed: boolean
  /** Bytes of the SKILL.md; used by the panel to size the listing. */
  bytes: number
}

const BUNDLED_ROOT = new URL('../bundled-skill/', import.meta.url)

/**
 * Read one SKILL.md and pull frontmatter out.
 *
 * Accepts both `description:` on one line and the multi-line YAML block
 * `description: |` form virtuoso-cli ships — vcli uses both shapes.
 */
function parseFrontmatter(content: string): { name?: string; description?: string } {
  const fence = '\n---'
  const start = content.startsWith('---') ? 0 : content.indexOf('\n---')
  if (start === -1) return {}
  const close = content.indexOf(fence, start === 0 ? 3 : start + 4)
  if (close === -1) return {}
  const block = content.slice(start === 0 ? 3 : start + 4, close).trim()
  const result: { name?: string; description?: string } = {}
  let descMultiline = false
  let descBuf: string[] = []
  for (const line of block.split('\n')) {
    if (line.startsWith('name:')) {
      result.name = line.slice('name:'.length).trim()
      continue
    }
    if (line.startsWith('description:')) {
      const rest = line.slice('description:'.length).trim()
      if (rest === '|' || rest === '>') {
        descMultiline = true
        continue
      }
      result.description = rest.replace(/^['"]|['"]$/g, '')
      continue
    }
    if (descMultiline) {
      if (line.startsWith(' ') || line.startsWith('\t')) {
        descBuf.push(line.trim())
        continue
      }
      descMultiline = false
      if (descBuf.length > 0) {
        result.description = descBuf.join(' ').trim()
        descBuf = []
      }
    }
  }
  if (descMultiline && descBuf.length > 0) {
    result.description = descBuf.join(' ').trim()
  }
  return result
}

/**
 * List bundled skills, sorted by id.
 *
 * Walks `bundled-skill/<id>/SKILL.md`. Anything that fails to parse is kept
 * in the listing with `parsed: false` so the user can see the gap, not be
 * silently dropped (#consistency:gap-detection).
 */
export function readBundledSkillSummaries(): BundledSkillSummary[] {
  let ids: string[] = []
  try {
    const dirents = readdirSync(BUNDLED_ROOT, { withFileTypes: true })
    ids = dirents.filter(d => d.isDirectory()).map(d => d.name)
  } catch {
    return []
  }
  ids.sort()
  const summaries: BundledSkillSummary[] = []
  for (const id of ids) {
    const skillPath = join(BUNDLED_ROOT.pathname, id, 'SKILL.md')
    let content: string
    try {
      const stat = statSync(skillPath)
      if (!stat.isFile()) continue
      content = readFileSync(skillPath, 'utf8')
    } catch {
      continue
    }
    const front = parseFrontmatter(content)
    summaries.push({
      id,
      name: front.name ?? id,
      description: front.description ?? '',
      parsed: front.name !== undefined,
      bytes: Buffer.byteLength(content),
    })
  }
  return summaries
}
