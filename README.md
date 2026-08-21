<p align="center">
  <img src="assets/logo.svg" width="96" alt="dsh-virtuoso logo">
</p>

# dsh-virtuoso

English | [中文](README.zh.md)

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

## Install

```sh
dsh plugin --profile web add dsh-virtuoso
```

Restart `dsh web`, then open **Settings → Virtuoso**.

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
  after `sync-skills` from a newer virtuoso-cli release.
- **Settings status panel** — the `vcli` binary presence, host/port/session
  bridge state, remote host / jump host / timeout / cache / log directories
  DSH reads out of your `VB_*` environment. One glance confirms the binary is on
  `PATH` and points at the right compute host; a clickable row copy of every
  value lets you paste into a fresh shell.
- **Tunnel control** — `Start tunnel`, `Stop tunnel`, and `Ping daemon` buttons
  in the panel each call out to `vcli tunnel start|stop` and `vcli session show`
  respectively. Built so the manual session registry ritual (`vcli session list`,
  hand-edit `~/.cache/virtuoso_bridge/sessions/*.json`) becomes one button.
- **Skill listing** — a third tab in the panel mirrors `bundled-skill/` to the
  user with description preview and size, so the model selection screen and the
  agent's `Bash`-allowed skill set stay auditable in one place.
- **Install commands** — the fourth tab pastes the `cargo install virtuoso-cli`
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
│  │  browser settings    │  ping, tunnel/*, skills}   │  (separate │ │
│  │  panel (client.js)   │◀─────────────→ host half    │  process)  │ │
│  └──────────────────────┘   (this plugin, node)      └────────────┘ │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

1. DSH auto-discovers `bundled-skill/` through its `dsh-skill-filesystem`
   provider. The skill descriptions end up in the model's context window just
   like every other skill; the skill body instructs the agent to run `vcli ...`.
2. The agent invokes `vcli skill exec 'let(...)'` etc. via the `Bash` tool.
   `vcli` is a separate Rust process; the plugin does not fork anything itself.
3. The browser settings panel calls `/dsh-virtuoso/status`, `/dsh-virtuoso/ping`,
   `/dsh-virtuoso/tunnel/start`, `/dsh-virtuoso/tunnel/stop`. The host half
   shells out to `vcli` once per click and returns the discriminated
   `{ ok, stdout, stderr, code, reason, durationMs }` payload.
4. The plugin reads `VB_HOST`, `VB_PORT`, `VB_SESSION`, `VB_REMOTE_HOST`,
   `VB_JUMP_HOST`, `VB_TIMEOUT` and so on straight out of `process.env`. The
   settings panel renders those exactly as `vcli` itself reads them — there is
   no second source of truth.

## Security

- The plugin spawns `vcli` with array-form `spawn` (no shell). The SKILL body
  arguments the agent types stay arguments, not shell strings.
- All POST routes accept same-origin only — previewing the panel from a
  malicious origin can read the rendered environment but cannot run a command.
- The host half never reads `~/.cache/virtuoso_bridge` directly. The tunnel /
  session files are `vcli`'s concern; surfacing them belongs in vcli itself
  (issue tracker upstream).
- The settings panel does not import clipboard contents and does not upload any
  state anywhere. The "copy" buttons use `navigator.clipboard.writeText` with
  nothing more than the literal `vcli` command the agent would type.
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
`vcli` binary path (and accept `virtuoso` as a legacy alias). It is idempotent:
running it twice with the same source produces byte-identical `bundled-skill/`.
The floor is 14 skills — if upstream's tree collapses below that, the script
aborts.

## Develop

```sh
npm install
npm run typecheck   # tsc for host (tsconfig.json) + client (tsconfig.client.json)
npm run build       # tsc → lib/, tsdown → client/client.js, banner preflight
node scripts/validate-skills.mjs   # confirm bundled-skill/ parses
```

The host half runs in the dsh-cordis-host-runner sandbox (Node, vm-isolated).
The client half runs in the dsh web bundle loader (browser, closure-factory).
Both halves type-check against the runtime types DSH ships under
`@deepseek-ai/cordis`, `@deepseek-ai/dsh-settings`, and
`@deepseek-ai/dsh-client-ui-primitives`.

## License

MIT · this plugin is a thin translation layer over the upstream
[virtuoso-cli](https://github.com/deanyou/virtuoso-cli), which itself is
MIT-licensed by deanyou.
