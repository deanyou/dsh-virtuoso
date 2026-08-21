<p align="center">
  <img src="assets/logo.svg" width="96" alt="dsh-virtuoso logo">
</p>

<h1 align="center">dsh-virtuoso</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/dsh-virtuoso"><img alt="npm version" src="https://img.shields.io/npm/v/dsh-virtuoso?color=cb3837&logo=npm"></a>
  <a href="https://github.com/deanyou/dsh-virtuoso/blob/main/LICENSE"><img alt="license" src="https://img.shields.io/npm/l/dsh-virtuoso"></a>
  <a href="https://github.com/deanyou/dsh-virtuoso/actions"><img alt="tests" src="https://img.shields.io/badge/tests-72%20passing-brightgreen"></a>
</p>

<p align="center">
  <a href="README.md">English</a> · <a href="README.zh.md">中文</a>
</p>

> `dsh-virtuoso` ships the Cadence Virtuoso EDA integration for the DeepSeek Harness:
> the `virtuoso-cli` agent skills are bundled so the model can drive SKILL, Maestro,
> Spectre, schematics, Verilog-A and the SSH tunnel directly from a DSH session;
> the settings panel exposes `vcli` health, tunnel control, and the `vcli`
> configuration the daemons read.
>
> The plugin is the **DSH-shaped bridge** over [virtuoso-cli](https://github.com/deanyou/virtuoso-cli).
> All execution paths run the `vcli` (or legacy `virtuoso`) binary the agent calls
> via `Bash`; the host half adds nothing to the trust surface — no extra remote,
> no extra daemon, no extra process — it only reads `VB_*` env vars and reports them.

## What's in `0.1.0`

This is the **first npm release** of dsh-virtuoso. Highlights:

- **Local-mode `tunnel/start` short-circuit** — `vcli tunnel start` no longer
  fails with `ssh "Could not resolve hostname"` when `VB_REMOTE_HOST` is
  unset. The route now probes `vcli session list` directly in local mode
  and returns the parsed session array as proof of liveness.
- **Connected Virtuoso panel section** — `GET /dsh-virtuoso/sessions`
  shows every active Virtuoso instance (id, port, host, user, started).
  `GET /dsh-virtuoso/session-current` highlights which instance
  auto-routing will pick for the next `vcli skill exec` (a `● active`
  marker on the matching row).
- **Auto-refresh toggle** — opt-in 30s polling for the status tab when
  you leave the panel open. Off by default; the panel is conservative.
- **Path-redacted stderr** — for shared-kiosk displays, `CallResult`
  scrubs `/foo/bar/...`-shaped strings before showing stderr. The raw
  stderr is still on the wire for curl/devtools.
- **Bundled-skill trust gate** — `sync-skills.mjs` now inserts an
  `allowed-tools: Bash(*/vcli *) Bash(*/virtuoso *) Read Write Edit`
  gate on every skill that ships without one. Five previously-ungated
  skills were patched in place.
- **Tests** — 72 unit tests across 6 files (config, vcli, http, routes,
  skills, redact-paths). `npm test` runs them in ~750 ms.
- **Published on npm** — `dsh plugin --profile web add dsh-virtuoso`
  installs from the registry; no build step, no `prepare` authorization.

## Install

Pick one of the four install paths below.

### A. From the npm registry (recommended for users)

```sh
dsh plugin --profile web add dsh-virtuoso
```

`npm publish` ships the pre-built `lib/` and `client/`; the user does not
need a build step, nor do they have to authorize any `prepare` script.
The trade-off vs tarball/Git-install: the published artifact is bound
to a specific `dsh-virtuoso` version; bug fixes require bumping the
version and re-publishing.

### B. From this checkout, via the helper (recommended for development)

```sh
npm install
npm run install:local        # = node scripts/install-locally.mjs
# (pass --profile <name> to install into a non-web profile;
#  pass --pack-only to produce the tarball without installing —
#  useful when running inside a sandbox that blocks writes to
#  ~/.dsh/profiles/<name>/)
```

`install:local` does the two-step dance that `dsh plugin add` does NOT do
for you: it `npm pack`s the repo into `dsh-virtuoso-<version>.tgz`, then
calls `dsh plugin --profile web add <that tgz>`. Without the pack step
pnpm sees `./dsh-virtuoso-0.1.0.tgz` as a missing file and aborts with
`ENOENT` (issue #1).

If `npm pack` succeeds but `dsh plugin add` fails with `EACCES` on the
profile dir, you are running inside a sandbox where `~/.dsh/profiles/<name>/`
is read-only. Use `--pack-only` and run `dsh plugin add` from a normal shell.

### C. From this checkout, by hand (equivalent to B, two steps)

```sh
npm install
npm run build
npm pack                                    # produces dsh-virtuoso-0.1.0.tgz
dsh plugin --profile web add ./dsh-virtuoso-0.1.0.tgz
```

### D. From a GitHub commit (no local checkout needed)

```sh
# `dsh plugin add` accepts git+https specifiers directly, but only as a
# real tarball URL — `github:owner/repo` shorthand depends on the dsh
# version. Substitute the commit/tag you want:
DSH_VIRTUOSO_REF="$(git -C /home/user1/git/dsh-virtuoso rev-parse HEAD)"
dsh plugin --profile web add "https://codeload.github.com/deanyou/dsh-virtuoso/tar.gz/${DSH_VIRTUOSO_REF}"
```

Whichever path you took:

```sh
dsh web                      # restart to load the new bundle
```

…then open **Settings → Virtuoso**.

**Requires dsh web 0.1.0-rc.7 or newer.** On an older host the plugin disables
its UI entry cleanly rather than rendering against primitives that aren't there:
if the **Settings → Virtuoso** entry never appears, that is usually why.

## What you get

- **Bundled agent skills** — every skill in [virtuoso-cli](https://github.com/deanyou/virtuoso-cli/tree/main/.agents/skills)
  is shipped inside the plugin at `bundled-skill/<id>/SKILL.md` and auto-discovered by
  DSH's `dsh-skill-filesystem`. Eighteen skills today, covering SKILL execution,
  Maestro, simulation setup/run/sweep/measure, schematic generation, Verilog-A
  design, gm/Id methodology, amplifier copilot, circuit optimization, ocean
  netlist regen, two "gotchas" skills (SKILL shell + Spectre netlist), the
  spec-driven design flow, and the tunnel-connect bootstrap. New skills show up
  after `sync-skills` from a newer virtuoso-cli release. **Every** bundled skill
  carries an `allowed-tools:` gate limiting it to `vcli` (or the legacy
  `virtuoso` alias) plus Read/Write/Edit — the agent cannot pivot through
  these skills to invoke arbitrary tools.
- **Settings status panel** — the `vcli` binary presence, host/port/session
  bridge state, remote host / jump host / timeout / cache / log directories
  DSH reads out of your `VB_*` environment. The header note reminds you
  that `VB_*` values are read from the dsh-web process env and need a
  restart to take effect.
- **Connected Virtuoso** — a dedicated panel section lists every active
  Virtuoso instance with id/port/host/user/started. The session the
  auto-routing layer would pick (`vcli session current`) gets a `● active`
  marker. No more guessing which instance the next `vcli skill exec`
  will land on.
- **Tunnel control** — `Start tunnel`, `Stop tunnel`, and `Ping daemon`
  buttons in the panel each call out to `vcli tunnel start|stop` and
  `vcli session list` respectively (round-1 fix: `session show` requires
  a session ID and would crash on local mode). In local mode the tunnel
  buttons are **disabled** with a hint explaining why; the `Ping daemon`
  button stays enabled and probes the daemon via `session list`.
- **Auto-refresh** — an opt-in 30 s polling toggle (`⏱ off` / `⏱ 30s`)
  re-fetches status, sessions, and session-current in parallel. Off by
  default so the panel doesn't surprise anyone; flip it on when you leave
  the panel open while waiting for a daemon restart.
- **Skill listing** — a third tab in the panel mirrors `bundled-skill/` to the
  user with description preview and size, so the model selection screen and the
  agent's `Bash`-allowed skill set stay auditable in one place.
- **Install commands** — a fourth tab pastes the `cargo install virtuoso-cli`
  commands and the SKILL bridge `load(...)` line into your clipboard, with the
  exact wording virtuoso-cli's `ramic_bridge.il` accepts.
- **Settings card** — on dsh 0.1.0-rc.7 and newer the plugin manages **itself**
  from **Settings → Plugins → Plugin configuration**: see the running version,
  whether `vcli` was detected, and the bundled-skill count. Toggle
  **Allow tunnel start** off when the deployment is air-gapped, toggle
  **Allow restart** off under systemd/launchd supervision.

## How it works

```
┌──────────────────────────────────────────────────────────────────────┐
│  DSH session                                                        │
│                                                                      │
│  ┌──────────────────────┐       Bash(*/vcli *)        ┌────────┐     │
│  │   agent (skill:      │ ───────────────────────────▶│  vcli  │     │
│  │   skill-exec,        │                            └────────┘     │
│  │   sim-run, ...)      │                                  │        │
│  │   bundled-skill/)    │                                  ▼        │
│  └──────────────────────┘                            ┌────────────┐ │
│                                                      │  vcli      │ │
│  ┌──────────────────────┐  /dsh-virtuoso/{status,    │  daemon    │ │
│  │  browser settings    │  sessions, session-current, │  (separate │ │
│  │  panel (client.js)   │  ping, tunnel/*, skills,    │  process)  │ │
│  │                      │  loader}                    │            │ │
│  └──────────────────────┘◀─────────────→ host half  └────────────┘ │
│   (this plugin, browser)    (this plugin, node)                    │
└──────────────────────────────────────────────────────────────────────┘
```

1. DSH auto-discovers `bundled-skill/` through its `dsh-skill-filesystem`
   provider. The skill descriptions end up in the model's context window just
   like every other skill; the skill body instructs the agent to run `vcli ...`.
2. The agent invokes `vcli skill exec 'let(...)'` etc. via the `Bash` tool.
   `vcli` is a separate Rust process; the plugin does not fork anything itself.
3. The browser settings panel calls:
   - `GET  /dsh-virtuoso/status` — version, profile, full `VB_*` config dump
   - `GET  /dsh-virtuoso/sessions` — parsed `vcli session list` JSON
   - `GET  /dsh-virtuoso/session-current` — parsed `vcli session current` JSON
   - `POST /dsh-virtuoso/ping` — same as `vcli session list` (proves liveness)
   - `POST /dsh-virtuoso/tunnel/start` — calls `vcli tunnel start`, or short-circuits to a `vcli session list` probe in local mode
   - `POST /dsh-virtuoso/tunnel/stop` — calls `vcli tunnel stop`, or no-ops in local mode
   - `GET  /dsh-virtuoso/skills` — bundled-skill metadata
   - `GET  /dsh-virtuoso/loader` — the DSH plugin stack
   The host half shells out to `vcli` once per click and returns the discriminated
   `{ ok, stdout, stderr, code, reason, durationMs, mode?, note? }` payload.
4. The plugin reads `VB_HOST`, `VB_PORT`, `VB_SESSION`, `VB_REMOTE_HOST`,
   `VB_JUMP_HOST`, `VB_TIMEOUT` and so on straight out of `process.env`. The
   settings panel renders those exactly as `vcli` itself reads them — there is
   no second source of truth.

## Security

- The plugin spawns `vcli` with array-form `spawn` (no shell). The SKILL body
  arguments the agent types stay arguments, not shell strings.
- Every bundled skill carries an `allowed-tools: Bash(*/vcli *) Bash(*/virtuoso *) Read Write Edit`
  gate. `scripts/sync-skills.mjs` enforces the gate on every sync; the agent
  cannot pivot through bundled skills to invoke arbitrary tools.
- All POST routes accept same-origin only — previewing the panel from a
  malicious origin can read the rendered environment but cannot run a command.
  The `sameOrigin` gate ignores scheme (HTTPS vs HTTP) intentionally: the
  browser blocks mixed-content requests at the network layer, so a
  scheme-mismatch check is not a real attack vector and would only reject
  legitimate dev-mode traffic.
- The host half never reads `~/.cache/virtuoso_bridge` directly. The tunnel /
  session files are `vcli`'s concern; surfacing them belongs in vcli itself
  (issue tracker upstream).
- The settings panel does not import clipboard contents and does not upload any
  state anywhere. The "copy" buttons use `navigator.clipboard.writeText` with
  nothing more than the literal `vcli` command the agent would type.
- The `CallResult` component scrubs `/foo/bar/...`-shaped strings from
  `stderr` before display, so a shared-kiosk panel doesn't leak the
  operator's home directory path. The raw stderr is on the wire for
  curl/devtools; only the panel rendering is sanitized.
- Listing the bundled skills ≠ endorsing the upstream. The skills live inside
  the package and ship with it; review them in `bundled-skill/<id>/SKILL.md`
  before updating.

## Sync with upstream

```sh
node scripts/sync-skills.mjs ../virtuoso-cli
```

`scripts/sync-skills.mjs` is the only entry point that touches `bundled-skill/`.
It wipes the directory and copies the upstream tree verbatim, rewriting the
`allowed-tools:` frontmatter line so the bundled skills work through the
`vcli` binary path (and accept `virtuoso` as a legacy alias). The script
**inserts** the line if missing — the previous version only rewrote an
existing line, which left five skills ungated. It is idempotent: running it
twice with the same source produces byte-identical `bundled-skill/`.
The floor is 14 skills — if upstream's tree collapses below that, the script
aborts.

## Develop

```sh
npm install
npm run typecheck   # tsc for host (tsconfig.json) + client (tsconfig.client.json)
npm run build       # tsc → lib/, tsdown → client/client.js, banner preflight
npm test            # vitest run (72 tests, ~750 ms)
npm run check       # all of the above + scripts/validate-skills.mjs + check-inject-boundary.mjs
```

The host half runs in the dsh-cordis-host-runner sandbox (Node, vm-isolated).
The client half runs in the dsh web bundle loader (browser, closure-factory).
Both halves type-check against the runtime types DSH ships under
`@deepseek-ai/cordis`, `@deepseek-ai/dsh-settings`, and
`@deepseek-ai/dsh-client-ui-primitives`.

### Tests

`npm test` runs 72 unit tests across 6 files:

- `tests/config.test.ts` (22) — `isRemote` derivation, numeric coercion, binary-path cache
- `tests/vcli.test.ts` (9) — `callVcli` branches (missing/timeout/exit/spawn-error) and array-form spawn
- `tests/http.test.ts` (15) — `sameOrigin`, `sendJson`, `readJsonBody`
- `tests/routes.test.ts` (6) — **the local-mode tunnel/start short-circuit** (regression test for the empty-hostname SSH error)
- `tests/skills.test.ts` (5) — bundled-skill listing invariants
- `tests/redact-paths.test.ts` (15) — path-redaction helper

Watch mode: `npm run test:watch`.

### Publish to npm

```sh
# Dry-run (preflight + check + dry-run only):
npm run publish:dry-run

# Real publish (requires a granular access token with "Bypass 2FA" in .npmrc):
npm run publish:npm
```

`scripts/publish-npm.mjs` wraps `npm publish` with:
- A `npm run check` preflight
- A `--dry-run` first
- A clear hint if the token lacks the 2FA-bypass grant (npm returns403 in that case)

`.npmrc` holds the token and is **gitignored**. Generate a fresh token at
https://www.npmjs.com/settings/tokens, choose **Granular Access Token**, and
check **Bypass 2FA**.

## License

MIT · this plugin is a thin translation layer over the upstream
[virtuoso-cli](https://github.com/deanyou/virtuoso-cli), which itself is
MIT-licensed by deanyou.