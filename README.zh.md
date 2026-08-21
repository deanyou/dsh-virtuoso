<p align="center">
  <img src="assets/logo.svg" width="96" alt="dsh-virtuoso 标志">
</p>

# dsh-virtuoso

[English](README.md) | 中文

> `dsh-virtuoso` 把 Cadence Virtuoso 的 EDA 集成带到 DeepSeek Harness:
> 把 [virtuoso-cli](https://github.com/deanyou/virtuoso-cli) 的 agent skills 全部打包,
> 让模型在 DSH 会话里就能直接驱动 SKILL、Maestro、Spectre、原理图、Verilog-A 与 SSH tunnel;
> 设置面板负责展示 `vcli` 健康度、tunnel 开关和 daemon 在读的 `VB_*` 配置。
>
> 插件自身只是 DSH 对 [virtuoso-cli](https://github.com/deanyou/virtuoso-cli) 的一层薄壳
> —— 所有执行路径都跑 `vcli`(老兼容也接受 `virtuoso`)binary,
> agent 通过 `Bash` 调用;host half 不引入新远端、不引入新守护、不引入新进程,
> 只是把 `VB_*` 环境变量读出来展示。

## 安装

下面四种安装路径,任选一种。

### A. 从发布的包(已经在 npm 之后)

```sh
dsh plugin --profile web add dsh-virtuoso
```

### B. 从本仓库,用 helper(开发期推荐)

```sh
npm install
npm run install:local        # = node scripts/install-locally.mjs
# 加 --profile <name> 装到非 web profile;加 --no-clean 保留 tarball
```

`install:local` 把 `dsh plugin add` **不替你做**的两步合上:先 `npm pack`
产出 `dsh-virtuoso-<version>.tgz`,再 `dsh plugin add` 那个文件。
少了 pack,pnpm 看到 `./dsh-virtuoso-0.1.0.tgz` 报 ENOENT 直接挂掉 (#1)。

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
  spec-driven 设计流程、tunnel-connect 引导。从更新的 virtuoso-cli 同步后,新 skill 自然出现在模型上下文中。
- **设置状态面板** —— `vcli` 是否在 PATH、host/port/session、远端主机 / 跳板主机 /
  超时 / 缓存 / 日志目录(全部从 `VB_*` 环境变量读出,与 daemon 自己读的一致)。
  一眼看出:二进制有没有装?指向哪台 compute 主机?每行可点击复制直接粘进新 shell。
- **Tunnel 控制** —— 面板里 `Start tunnel` / `Stop tunnel` / `Ping daemon`
  三个按钮,各自调用 `vcli tunnel start|stop` 与 `vcli session show`。
  设计意图是把手动 session 注册(`vcli session list`、手工编辑
  `~/.cache/virtuoso_bridge/sessions/*.json`)做成一键。
- **Skill 清单** —— 面板的第三个 tab 镜像 `bundled-skill/`,带描述预览与字节数,
  让模型侧的 skill 列表和 agent 实际能调的工具集保持一处可审计。
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
│  │  浏览器设置面板      │  ping, tunnel/*, skills}   │  (独立     │ │
│  │  (client.js)         │◀─────────────→ host half    │  进程)     │ │
│  └──────────────────────┘   (本插件, Node)           └────────────┘ │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

1. DSH 通过 `dsh-skill-filesystem` 自动扫到 `bundled-skill/`。
   描述进入模型的上下文,跟其它 skill 没区别;正文指导 agent 跑 `vcli ...`。
2. agent 通过 `Bash` 工具调 `vcli skill exec 'let(...)'` 之类。
   `vcli` 是独立 Rust 进程;插件本身不派生子进程。
3. 浏览器面板调 `/dsh-virtuoso/{status, ping, tunnel/*}`。
   host half 每次点击调用 `vcli` 一次,返回统一形状
   `{ ok, stdout, stderr, code, reason, durationMs }`。
4. 插件直接从 `process.env` 读 `VB_HOST` / `VB_PORT` / `VB_SESSION` /
   `VB_REMOTE_HOST` / `VB_JUMP_HOST` / `VB_TIMEOUT` 等。设置面板展示的值
   与 `vcli` 自己读的一致 —— **没有第二份真值**。

## 安全

- 插件用 **数组形式 `spawn`** 调用 `vcli`(不走 shell)。
  agent 在 SKILL 里输入的命令保持参数形式,不会被 shell 改写。
- 所有 POST 路由只接受 same-origin —— 恶意源能看到渲染出来的环境,
  但执行不了任何命令。
- host half 不直接读 `~/.cache/virtuoso_bridge`。
  tunnel / session 文件属于 `vcli` 自己,暴露它们的时机在 vcli 上游。
- 设置面板不导入剪贴板内容、不上传任何状态。「复制」按钮只调用
  `navigator.clipboard.writeText`,内容是 agent 原本会敲的 `vcli` 命令字面值。
- 列出 bundled skills ≠ 背书上游。skill 跟插件包一起发布,
  更新前请先翻一下 `bundled-skill/<id>/SKILL.md`。

## 同步上游

```sh
node scripts/sync-skills.mjs ../virtuoso-cli
```

`scripts/sync-skills.mjs` 是唯一会改 `bundled-skill/` 的入口。
它清空目录,完整复制上游 skill 树,把每条 frontmatter 的 `allowed-tools:`
重写为 `Bash(*/vcli *) Bash(*/virtuoso *) Read Write Edit`,这样打包的 skill
走 `vcli` 路径(`virtuoso` 作为历史别名也接受)。脚本是**幂等**的:
同一上游连跑两次会产生字节级相同的 `bundled-skill/`。
下限 14 个 skill —— 上游若缩水到这之下,脚本会中止。

## 开发

```sh
npm install
npm run typecheck   # tsc 跑 host (tsconfig.json) + client (tsconfig.client.json)
npm run build       # tsc → lib/,tsdown → client/client.js,做 banner 校验
node scripts/validate-skills.mjs   # 确认 bundled-skill/ 能解析
```

host half 跑在 dsh-cordis-host-runner 沙箱(Node + vm 隔离);
client half 跑在 dsh web bundle loader(浏览器 + 闭包工厂)。
两端类型检查都依赖 DSH 在 `@deepseek-ai/cordis` /
`@deepseek-ai/dsh-settings` / `@deepseek-ai/dsh-client-ui-primitives` 暴露的运行时类型。

## 许可

MIT。本插件是 [virtuoso-cli](https://github.com/deanyou/virtuoso-cli) 之上的薄翻译层,
virtuoso-cli 本身是 deanyou 以 MIT 发布。
