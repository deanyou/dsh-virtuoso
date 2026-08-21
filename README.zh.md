<p align="center">
  <img src="assets/logo.svg" width="96" alt="dsh-virtuoso 标志">
</p>

<h1 align="center">dsh-virtuoso</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/dsh-virtuoso"><img alt="npm 版本" src="https://img.shields.io/npm/v/dsh-virtuoso?color=cb3837&logo=npm"></a>
  <a href="https://github.com/deanyou/dsh-virtuoso/blob/main/LICENSE.md"><img alt="license" src="https://img.shields.io/npm/l/dsh-virtuoso"></a>
  <a href="https://github.com/deanyou/dsh-virtuoso/actions"><img alt="tests" src="https://img.shields.io/badge/tests-95%20passing-brightgreen"></a>
</p>

<p align="center">
  <a href="README.md">English</a> · 中文
</p>

> `dsh-virtuoso` 把 Cadence Virtuoso 的 EDA 集成带到 DeepSeek Harness:
> 把 [virtuoso-cli](https://github.com/deanyou/virtuoso-cli) 的 agent skills 全部打包,
> 让模型在 DSH 会话里就能直接驱动 SKILL、Maestro、Spectre、原理图、Verilog-A 与 SSH tunnel;
> 设置面板负责展示 `vcli` 健康度、tunnel 开关和 daemon 在读的 `VB_*` 配置。
>
> 插件自身只是 DSH 对 [virtuoso-cli](https://github.com/deanyou/virtuoso-cli) 的一层薄壳
> —— 所有执行路径都跑 `vcli`(老兼容也接受 `virtuoso`)binary,
> agent 通过 `Bash` 调用;host half 不引入新远端、不引入新守护、不引入新进程,
> 只是把 `VB_*` 环境变量读出来展示。

## 0.1.0 更新要点

这是 dsh-virtuoso **首次发布到 npm**。重点:

- **`tunnel/start` 本地模式短路** —— `vcli tunnel start` 在 `VB_REMOTE_HOST`
  未设置时不再报 `ssh "Could not resolve hostname"`。路由现在在本地模式
  直接探测 `vcli session list`,把解析后的会话数组作为存活证据返回。
- **「已连接的 Virtuoso」面板段** —— `GET /dsh-virtuoso/sessions`
  列出每个活动 Virtuoso 实例(id / port / host / user / 启动时间)。
  `GET /dsh-virtuoso/session-current` 在匹配行打上 `● active`
  标记,告诉操作员下次 `vcli skill exec` 会落到哪一台。
- **自动刷新开关** —— 状态 tab 上的可选 30s 轮询。默认关闭,面板安静;
  留作打开等 daemon 重启时开启。
- **路径脱敏的 stderr** —— 共享大屏场景下,`CallResult` 在展示前把
  `/foo/bar/...` 形态的字符串洗掉。原始 stderr 仍在网线上,curl/devtools
  可见。
- **bundled-skill 信任门** —— `sync-skills.mjs` 现在为每一个缺失
  `allowed-tools:` 行的 skill 插入标准门
  (`Bash(*/vcli *) Bash(*/virtuoso *) Read Write Edit`)。原本未加门的
  5 个 skill 已经在仓里直接补上。
- **测试** —— 95 个单元测试,跨 7 个文件。`npm test` 跑约 750 ms。
- **npm 上架** —— `dsh plugin --profile web add dsh-virtuoso`
  从注册表安装;不需要 build,不需要为 `prepare` 授权。
- **新增用户级 skill** —— `POST /dsh-virtuoso/skills/add` 把 SKILL.md
  写到 `$DSH_HOME/skills/<id>/`,DSH 下次重启(或 inotify 监听器)
  自动发现。`allowed-tools:` 默认标准 vcli 门。文件归用户,归插件所在
  的 npm 包。
  *(面板不暴露「禁用 bundled skill」入口:DSH `SkillRegistry` 没有公开
  的按名反注册 API。需要屏蔽某个 bundled skill 时,可编辑
  `bundled-skill/<id>/SKILL.md` 加 `disable-model-invocation: true`。)*

## 安装

下面四种安装路径,任选一种。

### A. 从 npm 发布的包(用户推荐)

```sh
dsh plugin --profile web add dsh-virtuoso
```

`npm publish` 发布的是预构建的 `lib/` 和 `client/`,用户端不需要 build,
也不需要为 `prepare` 脚本授权。代价是发布产物与具体版本绑定,bug 修复需要
bump 版本号再发。

### B. 从本仓库,用 helper(开发期推荐)

```sh
npm install
npm run install:local        # = node scripts/install-locally.mjs
# 加 --profile <name> 装到非 web profile
# 加 --pack-only 只产 tarball,不 install —— 适用于运行在沙箱里、写到
#   ~/.dsh/profiles/<name>/ 会被拒绝的场景
```

`install:local` 把 `dsh plugin add` **不替你做**的两步合上:先 `npm pack`
产出 `dsh-virtuoso-<version>.tgz`,再 `dsh plugin add` 那个文件。
少了 pack,pnpm 看到 `./dsh-virtuoso-0.1.0.tgz` 报 ENOENT 直接挂掉 (#1)。

如果 `npm pack` 成功但 `dsh plugin add` 报 `EACCES` 在 profile 目录,
说明你在沙箱里跑、`~/.dsh/profiles/<name>/` 只读。用 `--pack-only` 把 tarball
保留下来,然后在普通 shell 里执行 `dsh plugin add`。

### C. 从本仓库,手动(等价 B,两步走)

```sh
npm install
npm run build
npm pack                                    # 产出 dsh-virtuoso-0.1.0.tgz
dsh plugin --profile web add ./dsh-virtuoso-0.1.0.tgz
```

### D. 从 GitHub commit(不需要本地 checkout)

```sh
# `dsh plugin add` 能直接吃 git+https tarball,但 `github:owner/repo` 这种
# shorthand 是否可用取决于 dsh 版本。下面给一个稳的写法,引用你想要的 commit/tag:
DSH_VIRTUOSO_REF="$(git -C /home/user1/git/dsh-virtuoso rev-parse HEAD)"
dsh plugin --profile web add "https://codeload.github.com/deanyou/dsh-virtuoso/tar.gz/${DSH_VIRTUOSO_REF}"
```

无论走哪条路:

```sh
dsh web                      # 重启让新 bundle 生效
```

…然后打开 **Settings → Virtuoso**。

**需要 dsh web 0.1.0-rc.7+**。在更老的主机上,插件会**静默退出**而不渲染(避免在缺失的 primitives 上爆错):
如果 **Settings → Virtuoso** 菜单从未出现,通常是因为这个。

## 你拿到什么

- **打包的 agent skills** —— 上游 [virtuoso-cli](https://github.com/deanyou/virtuoso-cli/tree/main/.agents/skills)
  的每个 skill 都作为 `bundled-skill/<id>/SKILL.md` 一起发布,DSH 的 `dsh-skill-filesystem`
  会自动发现。共 18 个 skill:SKILL 执行、Maestro、仿真 setup/run/sweep/measure、
  原理图生成、Verilog-A 设计、gm/Id 设计方法学、放大器 copilot、电路优化、
  ocean netlist 重新生成、两个 gotchas(SKILL shell + Spectre netlist)、
  spec-driven 设计流程、tunnel-connect 引导。**每一个** bundled skill 都
  自带 `allowed-tools:` 门,只能跑 `vcli`(或历史别名 `virtuoso`)
  加 Read/Write/Edit,模型无法通过这些 skill 调用任意工具。
- **设置状态面板** —— `vcli` 是否在 PATH、host/port/session、远端主机 / 跳板主机 /
  超时 / 缓存 / 日志目录(全部从 `VB_*` 环境变量读出,与 daemon 自己读的一致)。
  面板顶部的提示会告诉你:这些值是 dsh web 进程 env 读的,改完要重启 dsh web 才生效。
- **已连接的 Virtuoso** —— 独立的段列出每个活动 Virtuoso 实例
  (id / port / host / user / 启动时间)。自动路由层选中的那个
  (`vcli session current`)会打上 `● active` 标记。下次 `vcli skill exec`
  落到哪台,不用猜。
- **Tunnel 控制** —— 面板里 `Start tunnel` / `Stop tunnel` / `Ping daemon`
  三个按钮,分别调用 `vcli tunnel start|stop` 和 `vcli session list`
  (R1 修复:`session show` 要要 `<ID>`,本地模式会崩)。本地模式时 tunnel
  按钮**禁用**并提示原因;`Ping daemon` 仍可用,通过 `session list` 探活。
- **自动刷新** —— 状态 tab 上的可选 30s 轮询开关(`⏱ off` / `⏱ 30s`),
  并行拉取 status / sessions / session-current。默认关,面板安静;
  留面板等 daemon 重启时开。
- **Skill 清单** —— 面板的第三个 tab 镜像 `bundled-skill/`,带描述预览与字节数,
  让模型侧的 skill 列表和 agent 实际能调的工具集保持一处可审计。
- **新增用户级 skill** —— 同一个 tab 上有**新增用户级 skill** 表单,把
  SKILL.md 写入 `$DSH_HOME/skills/<id>/`。DSH 的 `skill-filesystem` provider
  在下次重启(或通过 inotify 监听器)时自动发现。`allowed-tools:` 默认
  为标准 vcli 门。卸载插件后用户的 skill 依然存在 —— **你的 skill,你的磁盘**。
  *(面板不提供禁用 bundled skill 的入口:DSH 的 `SkillRegistry` 没有公开
  按名反注册的方法。若需要屏蔽某个 bundled skill,可编辑
  `bundled-skill/<id>/SKILL.md` 加上 `disable-model-invocation: true`。)*
- **安装命令** —— 第四个 tab 把 `cargo install virtuoso-cli` 与 SKILL bridge 的
  `load(...)` 行送进剪贴板,字符与 virtuoso-cli's `ramic_bridge.il` 完全一致。
- **插件配置卡片** —— dsh 0.1.0-rc.7+,在 **Settings → Plugins → Plugin configuration**
  里管理插件自身:版本、`vcli` 是否检测到、打包 skill 个数。
  把 **Allow tunnel start** 关掉以禁止在隔离环境创建 tunnel,把
  **Allow restart** 关掉以让 systemd/launchd 接管重启。

## 工作原理

```
┌──────────────────────────────────────────────────────────────────────┐
│  DSH 会话                                                            │
│                                                                      │
│  ┌──────────────────────┐       Bash(*/vcli *)        ┌────────┐     │
│  │   agent (skill:      │ ───────────────────────────▶│  vcli  │     │
│  │   skill-exec,        │                            └────────┘     │
│  │   sim-run, ...)      │                                  │        │
│  │   bundled-skill/)    │                                  ▼        │
│  └──────────────────────┘                            ┌────────────┐ │
│                                                      │  vcli      │ │
│  ┌──────────────────────┐  /dsh-virtuoso/{status,    │  daemon    │ │
│  │  浏览器设置面板      │  sessions, session-current, │  (独立     │ │
│  │  (client.js)         │  ping, tunnel/*, skills,    │  进程)     │ │
│  │                      │  loader}                    │            │ │
│  └──────────────────────┘◀─────────────→ host half  └────────────┘ │
│   (本插件, 浏览器)        (本插件, Node)                            │
└──────────────────────────────────────────────────────────────────────┘
```

1. DSH 通过 `dsh-skill-filesystem` 自动扫到 `bundled-skill/`。
   描述进入模型的上下文,跟其它 skill 没区别;正文指导 agent 跑 `vcli ...`。
2. agent 通过 `Bash` 工具调 `vcli skill exec 'let(...)'` 之类。
   `vcli` 是独立 Rust 进程;插件本身不派生子进程。
3. 浏览器面板调以下路由:
   - `GET  /dsh-virtuoso/status` — 版本、profile、完整 `VB_*` 配置
   - `GET  /dsh-virtuoso/sessions` — 解析后的 `vcli session list` JSON
   - `GET  /dsh-virtuoso/session-current` — 解析后的 `vcli session current` JSON
   - `POST /dsh-virtuoso/ping` — 同 `vcli session list`(证明 daemon 活)
   - `POST /dsh-virtuoso/tunnel/start` — 调 `vcli tunnel start`,本地模式短路为 `vcli session list` 探测
   - `POST /dsh-virtuoso/tunnel/stop` — 调 `vcli tunnel stop`,本地模式 no-op
   - `GET  /dsh-virtuoso/skills` — bundled-skill 元数据
   - `POST /dsh-virtuoso/skills/add` — 写一个 SKILL.md 到 `$DSH_HOME/skills/<id>/`
   - `GET  /dsh-virtuoso/loader` — DSH 插件栈
   host half 每次点击调用 `vcli` 一次,返回统一形状
   `{ ok, stdout, stderr, code, reason, durationMs, mode?, note? }`。
4. 插件直接从 `process.env` 读 `VB_HOST` / `VB_PORT` / `VB_SESSION` /
   `VB_REMOTE_HOST` / `VB_JUMP_HOST` / `VB_TIMEOUT` 等。设置面板展示的值
   与 `vcli` 自己读的一致 —— **没有第二份真值**。

## 安全

- 插件用 **数组形式 `spawn`** 调用 `vcli`(不走 shell)。
  agent 在 SKILL 里输入的命令保持参数形式,不会被 shell 改写。
- 每一个 bundled skill 都带 `allowed-tools: Bash(*/vcli *) Bash(*/virtuoso *) Read Write Edit`
  门。`scripts/sync-skills.mjs` 在每次同步时强制插入这道门;模型无法
  通过 bundled skill 调用任意工具。
- 所有 POST 路由只接受 same-origin —— 恶意源能看到渲染出来的环境,
  但执行不了任何命令。`sameOrigin` 故意不区分 scheme(HTTPS / HTTP):
  浏览器在网络层就拦掉了 mixed-content 请求,scheme 不匹配不是真实攻击面,
  真要拒反而会把开发模式下的合法请求挡掉。
- host half 不直接读 `~/.cache/virtuoso_bridge`。
  tunnel / session 文件属于 `vcli` 自己,暴露它们的时机在 vcli 上游。
- 设置面板不导入剪贴板内容、不上传任何状态。「复制」按钮只调用
  `navigator.clipboard.writeText`,内容是 agent 原本会敲的 `vcli` 命令字面值。
- `CallResult` 在展示前对 `stderr` 做 `/foo/bar/...` 形态的路径脱敏,
  共享大屏不会泄露操作员的主目录路径。原始 stderr 仍在网线上,
  curl / devtools 可见;只有面板渲染是脱敏的。
- 列出 bundled skills ≠ 背书上游。skill 跟插件包一起发布,
  更新前请先翻一下 `bundled-skill/<id>/SKILL.md`。

## 同步上游

```sh
node scripts/sync-skills.mjs ../virtuoso-cli
```

`scripts/sync-skills.mjs` 是唯一会改 `bundled-skill/` 的入口。
它清空目录,完整复制上游 skill 树,把每条 frontmatter 的 `allowed-tools:`
重写为 `Bash(*/vcli *) Bash(*/virtuoso *) Read Write Edit`,这样打包的 skill
走 `vcli` 路径(`virtuoso` 作为历史别名也接受)。脚本**会插入**缺失的行
(原先只在行存在时才改),因此上游漏写门时会被自动补上。脚本是**幂等**的:
同一上游连跑两次会产生字节级相同的 `bundled-skill/`。
下限 14 个 skill —— 上游若缩水到这之下,脚本会中止。

## 开发

```sh
npm install
npm run typecheck   # tsc 跑 host (tsconfig.json) + client (tsconfig.client.json)
npm run build       # tsc → lib/,tsdown → client/client.js,做 banner 校验
npm test            # vitest run(72 个测试,约 750 ms)
npm run check       # 上面全部 + scripts/validate-skills.mjs + check-inject-boundary.mjs
```

host half 跑在 dsh-cordis-host-runner 沙箱(Node + vm 隔离);
client half 跑在 dsh web bundle loader(浏览器 + 闭包工厂)。
两端类型检查都依赖 DSH 在 `@deepseek-ai/cordis` /
`@deepseek-ai/dsh-settings` / `@deepseek-ai/dsh-client-ui-primitives` 暴露的运行时类型。

### 测试

`npm test` 跑 95 个单元测试,跨 7 个文件:

- `tests/config.test.ts` (22) — `isRemote` 派生、数值强转、二进制路径缓存
- `tests/vcli.test.ts` (9) — `callVcli` 各分支(missing/timeout/exit/spawn-error)以及数组形式 spawn
- `tests/http.test.ts` (15) — `sameOrigin`、`sendJson`、`readJsonBody`
- `tests/routes.test.ts` (6) — **本地模式 tunnel/start 短路**(空 hostname SSH 错误的回归测试)
- `tests/skills.test.ts` (5) — bundled-skill 列表不变式
- `tests/redact-paths.test.ts` (15) — 路径脱敏 helper
- `tests/user-skill.test.ts` (23) — `validateUserSkillDraft`、`buildSkillMarkdown`、`resolveDshSkillsRoot` / `resolveUserSkillPath`

监听模式:`npm run test:watch`。

### 发布到 npm

```sh
# 干跑(preflight + check + 干跑,不发):
npm run publish:dry-run

# 真实发布(.npmrc 需要带「Bypass 2FA」的 granular access token):
npm run publish:npm
```

`scripts/publish-npm.mjs` 在 `npm publish` 外面套了:
- `npm run check` 预检
- 先 `--dry-run`
- token 缺 2FA 绕过授权(npm 返回 403)时给出明确提示

`.npmrc` 持有 token,**被 .gitignore 忽略**。新 token 从
https://www.npmjs.com/settings/tokens 生成,选 **Granular Access Token**,
勾上 **Bypass 2FA**。

## 许可

MIT。本插件是 [virtuoso-cli](https://github.com/deanyou/virtuoso-cli) 之上的薄翻译层,
virtuoso-cli 本身是 deanyou 以 MIT 发布。