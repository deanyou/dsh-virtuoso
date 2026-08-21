/** zh/en dictionaries for the Virtuoso settings section and the install toast. */

export const zh = {
  nav: 'Virtuoso',
  setCardDesc: '查看版本、状态，或移除 Virtuoso 集成插件。bundled skills 由插件自带,不会随插件被移除而消失。',
  versionHint: '插件版本 — 反馈问题时请附上',
  version: '版本',

  // 主页面 tab
  tabStatus: '状态',
  tabSkills: 'Skills',
  tabInstall: '安装 vcli',

  // 状态 tab
  statusTitle: '本地 vcli 状态',
  statusBinary: 'vcli 可执行文件',
  statusBinaryYes: '已检测到',
  statusBinaryNo: '未找到',
  statusBinaryHint: '需要先运行 `cargo install virtuoso-cli` 才能调用外部 EDA 工具。',
  statusConfig: '环境配置',
  statusProfile: '当前 profile',
  statusHost: 'Virtuoso 主机',
  statusPort: '端口',
  statusSession: '会话',
  statusRemote: '远端 (VB_REMOTE_HOST)',
  statusJump: '跳板 (VB_JUMP_HOST)',
  statusCache: '缓存目录',
  statusLog: '日志目录',
  statusTimeout: '超时',

  // tunnel 操作
  tunnelStart: '建立隧道',
  tunnelStop: '断开隧道',
  tunnelStatus: 'Ping daemon',
  tunnelStarted: '已建立隧道',
  tunnelStopped: '已断开',
  tunnelPing: 'daemon 已响应',
  tunnelPingFailed: 'daemon 未响应',
  tunnelDisabledHint: '请先到 Settings → Plugins → Virtuoso integration 打开「允许隧道」开关',

  // skills tab
  skillsTitle: 'bundled agent skills',
  skillsHint: 'vcli 的 18 个 agent skill 已随插件一并发布,DSH 的 skill-filesystem 会自动发现。',
  skillsParsed: '已解析',
  skillsBroken: 'frontmatter 缺失',
  skillsBytes: '字节',

  // 安装 tab
  installTitle: '安装 vcli',
  installFromCrates: '从 crates.io 安装(推荐)',
  installFromCratesCommand: 'cargo install virtuoso-cli',
  installFromSource: '从源码安装',
  installFromSourceCommand: 'git clone https://github.com/deanyou/virtuoso-cli.git\ncd virtuoso-cli\ncargo install --path .',
  installLoadBridge: '加载到 Virtuoso CIW',
  installLoadBridgeHint: '在 Virtuoso CIW 中执行 (可写入 ~/.cdsinit 以自动加载):',
  installLoadBridgeCommand: 'load("/path/to/virtuoso-cli/resources/ramic_bridge.il")',

  // 通用
  refresh: '刷新',
  copy: '复制命令',
  copied: '已复制',
  retry: '重试',
  cancel: '取消',
  empty: '(空)',
  ok: '正常',
  warn: '警告',
  fail: '失败',
}

export const en = {
  nav: 'Virtuoso',
  setCardDesc: 'View version, status, or remove the Virtuoso integration. The bundled skills ship with the plugin and survive its removal unless you also clean them up.',
  versionHint: 'Plugin version — please include when reporting issues',
  version: 'Version',

  tabStatus: 'Status',
  tabSkills: 'Skills',
  tabInstall: 'Install vcli',

  statusTitle: 'Local vcli status',
  statusBinary: 'vcli executable',
  statusBinaryYes: 'detected',
  statusBinaryNo: 'not found',
  statusBinaryHint: 'Run `cargo install virtuoso-cli` first; the bundled skills will not work without it.',
  statusConfig: 'Environment',
  statusProfile: 'current profile',
  statusHost: 'Virtuoso host',
  statusPort: 'port',
  statusSession: 'session',
  statusRemote: 'remote (VB_REMOTE_HOST)',
  statusJump: 'jump host (VB_JUMP_HOST)',
  statusCache: 'cache dir',
  statusLog: 'log dir',
  statusTimeout: 'timeout',

  tunnelStart: 'Start tunnel',
  tunnelStop: 'Stop tunnel',
  tunnelStatus: 'Ping daemon',
  tunnelStarted: 'Tunnel started',
  tunnelStopped: 'Tunnel stopped',
  tunnelPing: 'daemon responded',
  tunnelPingFailed: 'daemon did not respond',
  tunnelDisabledHint: 'Enable the Allow-tunnel toggle under Settings → Plugins → Virtuoso integration first.',

  skillsTitle: 'bundled agent skills',
  skillsHint: 'The 18 virtuoso-cli agent skills ship with this plugin. DSH\'s skill-filesystem picks them up automatically.',
  skillsParsed: 'parsed',
  skillsBroken: 'missing frontmatter',
  skillsBytes: 'bytes',

  installTitle: 'Install vcli',
  installFromCrates: 'Install from crates.io (recommended)',
  installFromCratesCommand: 'cargo install virtuoso-cli',
  installFromSource: 'Install from source',
  installFromSourceCommand: 'git clone https://github.com/deanyou/virtuoso-cli.git\ncd virtuoso-cli\ncargo install --path .',
  installLoadBridge: 'Load the bridge into Virtuoso CIW',
  installLoadBridgeHint: 'Paste this in the CIW (also safe to add to ~/.cdsinit):',
  installLoadBridgeCommand: 'load("/path/to/virtuoso-cli/resources/ramic_bridge.il")',

  refresh: 'Refresh',
  copy: 'Copy command',
  copied: 'Copied',
  retry: 'Retry',
  cancel: 'Cancel',
  empty: '(empty)',
  ok: 'OK',
  warn: 'warn',
  fail: 'fail',
}
