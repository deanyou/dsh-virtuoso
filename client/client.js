window.__ModuleLoader__.load({
	id: "dsh-virtuoso",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		//#endregion
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		_deepseek_ai_dsh_client_ui_primitives = __toESM(_deepseek_ai_dsh_client_ui_primitives, 1);
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/locales.ts
		/** zh/en dictionaries for the Virtuoso settings section and the install toast. */
		const zh = {
			nav: "Virtuoso",
			setCardDesc: "查看版本、状态，或移除 Virtuoso 集成插件。bundled skills 由插件自带,不会随插件被移除而消失。",
			versionHint: "插件版本 — 反馈问题时请附上",
			version: "版本",
			tabStatus: "状态",
			tabSkills: "Skills",
			tabInstall: "安装 vcli",
			statusTitle: "本地 vcli 状态",
			statusBinary: "vcli 可执行文件",
			statusBinaryYes: "已检测到",
			statusBinaryNo: "未找到",
			statusBinaryHint: "需要先运行 `cargo install virtuoso-cli` 才能调用外部 EDA 工具。",
			statusEnvHint: "环境变量从 dsh web 的进程环境读取,需重启 dsh web 才会生效。",
			statusConfig: "环境配置",
			statusProfile: "当前 profile",
			statusHost: "Virtuoso 主机",
			statusPort: "端口",
			statusSession: "会话",
			statusRemote: "远端 (VB_REMOTE_HOST)",
			statusJump: "跳板 (VB_JUMP_HOST)",
			statusCache: "缓存目录",
			statusLog: "日志目录",
			statusTimeout: "超时",
			sessionsTitle: "已连接的 Virtuoso",
			sessionsLoading: "正在加载会话列表…",
			sessionsEmpty: "当前没有运行中的 Virtuoso daemon。在 CIW 执行 RBStart() 注册一个会话。",
			sessionPort: "端口",
			sessionHost: "主机",
			sessionUser: "用户",
			sessionCreated: "启动时间",
			sessionActive: "vcli 自动路由到此",
			sessionCurrent: "当前自动选择的会话",
			sessionCurrentError: "无法确定自动选择的会话",
			tunnelSection: "隧道 / daemon",
			tunnelStart: "建立隧道",
			tunnelStop: "断开隧道",
			tunnelStatus: "Ping daemon",
			tunnelStarted: "已建立隧道",
			tunnelStopped: "已断开",
			tunnelPing: "daemon 已响应",
			tunnelPingFailed: "daemon 未响应",
			tunnelDisabledHint: "请先到 Settings → Plugins → Virtuoso integration 打开「允许隧道」开关",
			tunnelLocalHint: "VB_REMOTE_HOST 未设置或指向本机,这是本地模式 — daemon 直接通过本机端口访问,无需 SSH 隧道。「Ping daemon」按钮仍可用来确认本地 daemon 是否存活。",
			skillsTitle: "bundled agent skills",
			skillsHint: "vcli 的 agent skill 已随插件一并发布,DSH 的 skill-filesystem 会自动发现。",
			skillsParsed: "已解析",
			skillsBroken: "frontmatter 缺失",
			skillsBytes: "字节",
			skillAddUser: "新增用户级 skill",
			skillAddUserHint: "把自定义 SKILL.md 写到 $DSH_HOME/skills/<id>/,DSH 重启(或 skill-filesystem 监听器)后会自动发现。",
			skillFieldId: "id (kebab-case)",
			skillFieldIdPlaceholder: "my-custom-skill",
			skillFieldName: "显示名称",
			skillFieldNamePlaceholder: "My custom skill",
			skillFieldDescription: "描述",
			skillFieldDescriptionPlaceholder: "这一行告诉模型什么时候该用这个 skill",
			skillFieldBody: "正文 (SKILL.md body)",
			skillFieldBodyPlaceholder: "把这里当成 system prompt 写。SKILL 路径、参数、错误处理都在里面。",
			skillSubmit: "提交",
			skillAddOk: "已写入。重启 dsh web 或等监听器捡起新文件后,这个 skill 就会出现在模型上下文里。",
			skillValidationErrors: "字段校验失败",
			installTitle: "安装 vcli",
			installFromCrates: "从 crates.io 安装(推荐)",
			installFromCratesCommand: "cargo install virtuoso-cli",
			installFromSource: "从源码安装",
			installFromSourceCommand: "git clone https://github.com/deanyou/virtuoso-cli.git\ncd virtuoso-cli\ncargo install --path .",
			installLoadBridge: "加载到 Virtuoso CIW",
			installLoadBridgeHint: "在 Virtuoso CIW 中执行 (可写入 ~/.cdsinit 以自动加载):",
			installLoadBridgeCommand: "load(\"/path/to/virtuoso-cli/resources/ramic_bridge.il\")",
			refresh: "刷新",
			autoRefreshOn: "自动刷新: 开 (每 30 秒)",
			autoRefreshOff: "自动刷新: 关 (点击启用)",
			copy: "复制命令",
			copied: "已复制",
			retry: "重试",
			cancel: "取消",
			empty: "(空)",
			ok: "正常",
			warn: "警告",
			fail: "失败",
			loading: "加载中…"
		};
		const en = {
			nav: "Virtuoso",
			setCardDesc: "View version, status, or remove the Virtuoso integration. The bundled skills ship with the plugin and survive its removal unless you also clean them up.",
			versionHint: "Plugin version — please include when reporting issues",
			version: "Version",
			tabStatus: "Status",
			tabSkills: "Skills",
			tabInstall: "Install vcli",
			statusTitle: "Local vcli status",
			statusBinary: "vcli executable",
			statusBinaryYes: "detected",
			statusBinaryNo: "not found",
			statusBinaryHint: "Run `cargo install virtuoso-cli` first; the bundled skills will not work without it.",
			statusEnvHint: "Environment variables are read from the dsh web process env. Restart dsh web after changing them.",
			statusConfig: "Environment",
			statusProfile: "current profile",
			statusHost: "Virtuoso host",
			statusPort: "port",
			statusSession: "session",
			statusRemote: "remote (VB_REMOTE_HOST)",
			statusJump: "jump host (VB_JUMP_HOST)",
			statusCache: "cache dir",
			statusLog: "log dir",
			statusTimeout: "timeout",
			sessionsTitle: "Connected Virtuoso",
			sessionsLoading: "Loading session list…",
			sessionsEmpty: "No Virtuoso daemon is currently running. Run RBStart() in the CIW to register one.",
			sessionPort: "port",
			sessionHost: "host",
			sessionUser: "user",
			sessionCreated: "started",
			sessionActive: "vcli auto-routes here",
			sessionCurrent: "Auto-selected session",
			sessionCurrentError: "Could not determine auto-selected session",
			tunnelSection: "Tunnel / daemon",
			tunnelStart: "Start tunnel",
			tunnelStop: "Stop tunnel",
			tunnelStatus: "Ping daemon",
			tunnelStarted: "Tunnel started",
			tunnelStopped: "Tunnel stopped",
			tunnelPing: "daemon responded",
			tunnelPingFailed: "daemon did not respond",
			tunnelDisabledHint: "Enable the Allow-tunnel toggle under Settings → Plugins → Virtuoso integration first.",
			tunnelLocalHint: "VB_REMOTE_HOST is unset or points at this machine, so this is local mode — the daemon is reached directly, no SSH tunnel is needed. Use Ping daemon to confirm the local daemon is alive.",
			skillsTitle: "bundled agent skills",
			skillsHint: "The virtuoso-cli agent skills ship with this plugin. DSH's skill-filesystem picks them up automatically.",
			skillsParsed: "parsed",
			skillsBroken: "missing frontmatter",
			skillsBytes: "bytes",
			skillAddUser: "Add user-level skill",
			skillAddUserHint: "Write a SKILL.md to $DSH_HOME/skills/<id>/. DSH picks it up on restart (or via the skill-filesystem watcher).",
			skillFieldId: "id (kebab-case)",
			skillFieldIdPlaceholder: "my-custom-skill",
			skillFieldName: "display name",
			skillFieldNamePlaceholder: "My custom skill",
			skillFieldDescription: "description",
			skillFieldDescriptionPlaceholder: "One line telling the model when to use this skill",
			skillFieldBody: "body (SKILL.md content)",
			skillFieldBodyPlaceholder: "Treat as a system prompt. SKILL paths, args, error handling go here.",
			skillSubmit: "Submit",
			skillAddOk: "Written. Restart dsh web or wait for the watcher to pick up the new file; the skill then appears in the model context.",
			skillValidationErrors: "Validation errors",
			installTitle: "Install vcli",
			installFromCrates: "Install from crates.io (recommended)",
			installFromCratesCommand: "cargo install virtuoso-cli",
			installFromSource: "Install from source",
			installFromSourceCommand: "git clone https://github.com/deanyou/virtuoso-cli.git\ncd virtuoso-cli\ncargo install --path .",
			installLoadBridge: "Load the bridge into Virtuoso CIW",
			installLoadBridgeHint: "Paste this in the CIW (also safe to add to ~/.cdsinit):",
			installLoadBridgeCommand: "load(\"/path/to/virtuoso-cli/resources/ramic_bridge.il\")",
			refresh: "Refresh",
			autoRefreshOn: "Auto-refresh: on (every 30 s)",
			autoRefreshOff: "Auto-refresh: off (click to enable)",
			copy: "Copy command",
			copied: "Copied",
			retry: "Retry",
			cancel: "Cancel",
			empty: "(empty)",
			ok: "OK",
			warn: "warn",
			fail: "fail",
			loading: "Loading…"
		};
		//#endregion
		//#region src/client/market-data.ts
		/**
		* Redact file paths from a stderr string.
		*
		* Used by `CallResult` for shared-kiosk deployments where the panel is
		* visible to a wider audience and raw paths like
		* `/home/user1/.cache/virtuoso_bridge/...` would leak the operator's
		* username. Replaces anything matching an absolute path or
		* `/path/...` with `[PATH]` — preserves enough information for the
		* operator to debug (the shape of the error) without exposing real
		* filesystem layout.
		*
		* Not server-side: the route returns the raw stderr so the operator's
		* own copy of the panel can show full detail; the redaction is purely
		* a presentation concern.
		*/
		function redactPaths(input) {
			return input.replace(/\/(?:[\w.-]+)(?:\/[\w.-]+)+/g, "[PATH]").replace(/[A-Z]:\\(?:[\w.-]+\\?)+/gi, "[PATH]").replace(/~?\/[\w.~-]+(?:\/[\w.~-]+)+/g, "[PATH]");
		}
		//#endregion
		//#region src/client/VirtuosoSection.tsx
		/**
		* The Virtuoso settings section: tabs over the host routes, with refresh
		* polling for status and one-click tunnel/ping buttons. Plain presentation
		* — no host mutations beyond toggling the `Bash` skill at runtime via the
		*   agent, which is out of scope here (settings panel only).
		*/
		function VirtuosoSection(props) {
			const t = props.t;
			const [tab, setTab] = (0, react.useState)("status");
			const [status, setStatus] = (0, react.useState)(null);
			const [statusError, setStatusError] = (0, react.useState)(null);
			const [tunnel, setTunnel] = (0, react.useState)("idle");
			const [ping, setPing] = (0, react.useState)("idle");
			const [tunnelOutcome, setTunnelOutcome] = (0, react.useState)(null);
			const [pingOutcome, setPingOutcome] = (0, react.useState)(null);
			const [sessions, setSessions] = (0, react.useState)(null);
			const [sessionsError, setSessionsError] = (0, react.useState)(null);
			const [current, setCurrent] = (0, react.useState)(null);
			const [currentError, setCurrentError] = (0, react.useState)(null);
			const [copyState, setCopyState] = (0, react.useState)("idle");
			const [autoRefresh, setAutoRefresh] = (0, react.useState)(false);
			const refresh = (0, react.useCallback)(async () => {
				setStatusError(null);
				try {
					const r = await fetch("/dsh-virtuoso/status", { credentials: "same-origin" });
					if (!r.ok) throw new Error(`HTTP ${r.status}`);
					const data = await r.json();
					setStatus(data);
				} catch (err) {
					setStatusError(err.message);
				}
			}, []);
			const loadSessions = (0, react.useCallback)(async () => {
				setSessionsError(null);
				try {
					const r = await fetch("/dsh-virtuoso/sessions", { credentials: "same-origin" });
					if (!r.ok) {
						const fallback = await r.json().catch(() => null);
						throw new Error(fallback?.error ?? `HTTP ${r.status}`);
					}
					const data = await r.json();
					setSessions(data);
				} catch (err) {
					setSessionsError(err.message);
				}
			}, []);
			const loadCurrent = (0, react.useCallback)(async () => {
				setCurrentError(null);
				try {
					const r = await fetch("/dsh-virtuoso/session-current", { credentials: "same-origin" });
					if (!r.ok) {
						const fallback = await r.json().catch(() => null);
						throw new Error(fallback?.error ?? `HTTP ${r.status}`);
					}
					const data = await r.json();
					if (data.status === "error" || data.session === null) setCurrent(null);
					else setCurrent({
						session: data.session,
						port: data.port ?? 0,
						autoSelected: data.auto_selected ?? true
					});
				} catch (err) {
					setCurrentError(err.message);
					setCurrent(null);
				}
			}, []);
			const refreshAll = (0, react.useCallback)(async () => {
				await Promise.all([
					refresh(),
					loadSessions(),
					loadCurrent()
				]);
			}, [
				refresh,
				loadSessions,
				loadCurrent
			]);
			(0, react.useEffect)(() => {
				refreshAll();
			}, [refreshAll]);
			(0, react.useEffect)(() => {
				if (!autoRefresh || tab !== "status") return;
				const id = window.setInterval(() => {
					refreshAll();
				}, 3e4);
				return () => {
					window.clearInterval(id);
				};
			}, [
				autoRefresh,
				tab,
				refreshAll
			]);
			const tunnelStart = (0, react.useCallback)(async () => {
				if (status !== null && status.allowTunnelStart === false) {
					setTunnel("fail");
					setTunnelOutcome({
						ok: false,
						stdout: "",
						stderr: "allowTunnelStart=false",
						durationMs: 0,
						code: 403,
						reason: "forbidden"
					});
					return;
				}
				setTunnel("starting");
				try {
					const outcome = await (await fetch("/dsh-virtuoso/tunnel/start", {
						method: "POST",
						credentials: "same-origin"
					})).json();
					setTunnelOutcome(outcome);
					setTunnel(outcome.ok ? "ok" : "fail");
					refreshAll();
				} catch (err) {
					setTunnel("fail");
					setTunnelOutcome({
						ok: false,
						stdout: "",
						stderr: err.message,
						durationMs: 0,
						code: null,
						reason: "exit"
					});
				}
			}, [status, refreshAll]);
			const tunnelStop = (0, react.useCallback)(async () => {
				setTunnel("stopping");
				try {
					const outcome = await (await fetch("/dsh-virtuoso/tunnel/stop", {
						method: "POST",
						credentials: "same-origin"
					})).json();
					setTunnelOutcome(outcome);
					setTunnel(outcome.ok ? "ok" : "fail");
					refreshAll();
				} catch (err) {
					setTunnel("fail");
					setTunnelOutcome({
						ok: false,
						stdout: "",
						stderr: err.message,
						durationMs: 0,
						code: null,
						reason: "exit"
					});
				}
			}, [refreshAll]);
			const runPing = (0, react.useCallback)(async () => {
				setPing("pinging");
				try {
					const outcome = await (await fetch("/dsh-virtuoso/ping", {
						method: "POST",
						credentials: "same-origin"
					})).json();
					setPingOutcome(outcome);
					setPing(outcome.ok ? "ok" : "fail");
					refreshAll();
				} catch (err) {
					setPing("fail");
					setPingOutcome({
						ok: false,
						stdout: "",
						stderr: err.message,
						durationMs: 0,
						code: null,
						reason: "exit"
					});
				}
			}, [refreshAll]);
			const tabs = (0, react.useMemo)(() => [
				{
					id: "status",
					label: t("tabStatus")
				},
				{
					id: "skills",
					label: t("tabSkills")
				},
				{
					id: "install",
					label: t("tabInstall")
				}
			], [t]);
			const copyCommand = (0, react.useCallback)(async (text) => {
				try {
					await navigator.clipboard?.writeText(text);
					setCopyState("copied");
					setTimeout(() => setCopyState("idle"), 1500);
				} catch {}
			}, []);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Tabs, {
					tabs,
					active: tab,
					onChange: setTab
				}),
				tab === "status" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatusTab, {
					t,
					status,
					error: statusError,
					tunnelPhase: tunnel,
					tunnelOutcome,
					pingPhase: ping,
					pingOutcome,
					sessions,
					sessionsError,
					current,
					currentError,
					autoRefresh,
					onTunnelStart: tunnelStart,
					onTunnelStop: tunnelStop,
					onPing: runPing,
					onRefresh: () => void refreshAll(),
					onToggleAutoRefresh: () => setAutoRefresh((v) => !v)
				}),
				tab === "skills" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SkillsTab, {
					t,
					status
				}),
				tab === "install" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InstallTab, {
					t,
					onCopy: copyCommand,
					copyState
				})
			] });
		}
		function Tabs(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				style: tabsContainerStyle,
				children: props.tabs.map((tab) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-pressed": props.active === tab.id,
					onClick: () => props.onChange(tab.id),
					style: {
						...tabButtonStyle,
						...props.active === tab.id ? tabButtonActiveStyle : null
					},
					children: tab.label
				}, tab.id))
			});
		}
		const tabsContainerStyle = {
			display: "flex",
			gap: 8,
			borderBottom: "1px solid var(--dsh-color-divider, rgba(127,127,127,0.2))",
			marginBottom: 16
		};
		const tabButtonStyle = {
			background: "transparent",
			border: "none",
			padding: "8px 12px",
			cursor: "pointer",
			font: "inherit",
			color: "var(--dsh-color-text-secondary, #888)"
		};
		const tabButtonActiveStyle = {
			color: "var(--dsh-color-text-primary, #fff)",
			borderBottom: "2px solid var(--dsh-color-accent, #4f8ef7)",
			marginBottom: -1
		};
		function StatusTab(props) {
			const { t, status } = props;
			if (status === null && props.error === null) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "ongoing" }),
				" ",
				t("loading")
			] });
			if (props.error !== null) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutline16, { size: 14 }),
				" ",
				t("fail"),
				": ",
				props.error,
				" ",
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "ghost",
					onClick: props.onRefresh,
					children: t("retry")
				})
			] });
			if (status === null) return null;
			const tunnelDisabled = status.allowTunnelStart === false;
			const isLocal = status.cli.isRemote === false;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						marginBottom: 12
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
						style: { margin: 0 },
						children: t("statusTitle")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: 4
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
							label: props.autoRefresh ? t("autoRefreshOn") : t("autoRefreshOff"),
							side: "bottom",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: props.autoRefresh ? "primary" : "ghost",
								onClick: props.onToggleAutoRefresh,
								size: "sm",
								children: props.autoRefresh ? "⏱ 30s" : "⏱ off"
							})
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
							label: t("refresh"),
							side: "bottom",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "ghost",
								icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutline14, { size: 14 }),
								onClick: props.onRefresh
							})
						})]
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Row, {
					label: t("statusBinary"),
					value: status.cli.hasBinary ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, { size: 14 }),
						" ",
						t("statusBinaryYes")
					] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutline16, { size: 14 }),
						" ",
						t("statusBinaryNo")
					] })
				}),
				!status.cli.hasBinary && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Hint, { text: t("statusBinaryHint") }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Hint, { text: t("statusEnvHint") }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", {
					style: sectionHeadingStyle,
					children: t("statusConfig")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Row, {
					label: t("statusProfile"),
					value: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: status.profile })
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Row, {
					label: t("statusHost"),
					value: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: status.cli.host })
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Row, {
					label: t("statusPort"),
					value: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: status.cli.port })
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Row, {
					label: t("statusSession"),
					value: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: status.cli.session ?? t("empty") })
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Row, {
					label: t("statusRemote"),
					value: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: status.cli.remoteHost ?? t("empty") })
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Row, {
					label: t("statusJump"),
					value: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: status.cli.jumpHost ?? t("empty") })
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Row, {
					label: t("statusTimeout"),
					value: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("code", { children: [status.cli.timeoutSeconds, "s"] })
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Row, {
					label: t("statusCache"),
					value: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: status.cli.cacheDir })
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Row, {
					label: t("statusLog"),
					value: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: status.cli.logDir })
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", {
					style: sectionHeadingStyle,
					children: t("sessionsTitle")
				}),
				props.sessions === null && props.sessionsError === null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Hint, { text: t("sessionsLoading") }),
				props.sessionsError !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Hint, { text: `${t("fail")}: ${props.sessionsError}` }),
				props.sessions !== null && props.sessions.sessions.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Hint, { text: t("sessionsEmpty") }),
				props.sessions !== null && props.sessions.sessions.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					style: {
						display: "flex",
						flexDirection: "column",
						gap: 4
					},
					children: props.sessions.sessions.map((s, idx) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SessionRow, {
						session: s,
						currentId: props.current?.session ?? null,
						labels: {
							port: t("sessionPort"),
							host: t("sessionHost"),
							user: t("sessionUser"),
							started: t("sessionCreated"),
							active: t("sessionActive")
						}
					}, s.id ?? `s${idx}`))
				}),
				props.current !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Hint, { text: `${t("sessionCurrent")}: ${props.current.session} (port ${props.current.port})` }),
				props.currentError !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Hint, { text: `${t("sessionCurrentError")}: ${props.currentError}` }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", {
					style: sectionHeadingStyle,
					children: t("tunnelSection")
				}),
				tunnelDisabled && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Hint, { text: t("tunnelDisabledHint") }),
				isLocal && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Hint, { text: t("tunnelLocalHint") }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						gap: 8
					},
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "primary",
							disabled: tunnelDisabled || isLocal || props.tunnelPhase === "starting" || props.tunnelPhase === "stopping",
							onClick: props.onTunnelStart,
							icon: props.tunnelPhase === "starting" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconLoadingOutline16, { size: 14 }) : void 0,
							children: t("tunnelStart")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							disabled: isLocal || !status.cli.hasBinary || props.tunnelPhase === "starting" || props.tunnelPhase === "stopping",
							onClick: props.onTunnelStop,
							icon: props.tunnelPhase === "stopping" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconLoadingOutline16, { size: 14 }) : void 0,
							children: t("tunnelStop")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							disabled: !status.cli.hasBinary || props.pingPhase === "pinging",
							onClick: props.onPing,
							icon: props.pingPhase === "pinging" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconLoadingOutline16, { size: 14 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutline16, { size: 14 }),
							children: t("tunnelStatus")
						})
					]
				}),
				props.tunnelOutcome !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CallResult, {
					label: "tunnel",
					outcome: props.tunnelOutcome,
					okLabel: t("tunnelStarted"),
					failLabel: t("fail")
				}),
				props.pingOutcome !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CallResult, {
					label: "ping",
					outcome: props.pingOutcome,
					okLabel: t("tunnelPing"),
					failLabel: t("tunnelPingFailed")
				})
			] });
		}
		function SkillsTab(props) {
			const { t, status } = props;
			const [adding, setAdding] = (0, react.useState)(false);
			const [draftId, setDraftId] = (0, react.useState)("");
			const [draftName, setDraftName] = (0, react.useState)("");
			const [draftDescription, setDraftDescription] = (0, react.useState)("");
			const [draftBody, setDraftBody] = (0, react.useState)("");
			const [submitState, setSubmitState] = (0, react.useState)({ kind: "idle" });
			const reset = (0, react.useCallback)(() => {
				setDraftId("");
				setDraftName("");
				setDraftDescription("");
				setDraftBody("");
				setSubmitState({ kind: "idle" });
			}, []);
			const submit = (0, react.useCallback)(async () => {
				setSubmitState({ kind: "submitting" });
				try {
					const r = await fetch("/dsh-virtuoso/skills/add", {
						method: "POST",
						credentials: "same-origin",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							id: draftId,
							name: draftName,
							description: draftDescription,
							body: draftBody
						})
					});
					const payload = await r.json();
					if (r.status === 200 && payload.ok === true) setSubmitState({
						kind: "ok",
						path: payload.path,
						id: payload.id,
						note: payload.note
					});
					else if (r.status === 400 && payload.errors !== void 0) setSubmitState({
						kind: "validation",
						errors: payload.errors
					});
					else setSubmitState({
						kind: "error",
						code: payload.error ?? `HTTP ${r.status}`,
						reason: payload.reason
					});
				} catch (err) {
					setSubmitState({
						kind: "error",
						code: "network",
						reason: err.message
					});
				}
			}, [
				draftId,
				draftName,
				draftDescription,
				draftBody
			]);
			if (status === null) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "ongoing" }) });
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
					style: { margin: 0 },
					children: t("skillsTitle")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Hint, { text: t("skillsHint") }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						flexDirection: "column",
						gap: 4
					},
					children: [status.skills.map((s) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SkillRow, {
						skill: s,
						parsedLabel: t("skillsParsed"),
						brokenLabel: t("skillsBroken"),
						bytesLabel: t("skillsBytes")
					}, s.id)), status.skills.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Hint, { text: t("empty") })]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						marginTop: 16,
						paddingTop: 12,
						borderTop: "1px dashed var(--dsh-color-divider, rgba(127,127,127,0.15))"
					},
					children: [!adding && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "ghost",
						onClick: () => {
							setAdding(true);
							setSubmitState({ kind: "idle" });
						},
						icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutline16, { size: 14 }),
						children: t("skillAddUser")
					}), adding && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							flexDirection: "column",
							gap: 8
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", {
								style: sectionHeadingStyle,
								children: t("skillAddUser")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Hint, { text: t("skillAddUserHint") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								style: {
									display: "flex",
									flexDirection: "column",
									gap: 2
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									style: fieldLabelStyle,
									children: t("skillFieldId")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									style: inputStyle,
									value: draftId,
									onChange: (e) => setDraftId(e.target.value),
									placeholder: t("skillFieldIdPlaceholder")
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								style: {
									display: "flex",
									flexDirection: "column",
									gap: 2
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									style: fieldLabelStyle,
									children: t("skillFieldName")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									style: inputStyle,
									value: draftName,
									onChange: (e) => setDraftName(e.target.value),
									placeholder: t("skillFieldNamePlaceholder")
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								style: {
									display: "flex",
									flexDirection: "column",
									gap: 2
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									style: fieldLabelStyle,
									children: t("skillFieldDescription")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
									style: {
										...inputStyle,
										minHeight: 48
									},
									value: draftDescription,
									onChange: (e) => setDraftDescription(e.target.value),
									placeholder: t("skillFieldDescriptionPlaceholder")
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								style: {
									display: "flex",
									flexDirection: "column",
									gap: 2
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									style: fieldLabelStyle,
									children: t("skillFieldBody")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
									style: {
										...inputStyle,
										minHeight: 120,
										fontFamily: "ui-monospace, SFMono-Regular, monospace",
										fontSize: 12
									},
									value: draftBody,
									onChange: (e) => setDraftBody(e.target.value),
									placeholder: t("skillFieldBodyPlaceholder")
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									gap: 8
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "primary",
									disabled: submitState.kind === "submitting",
									onClick: submit,
									icon: submitState.kind === "submitting" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconLoadingOutline16, { size: 14 }) : void 0,
									children: submitState.kind === "submitting" ? t("loading") : t("skillSubmit")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "ghost",
									onClick: reset,
									disabled: submitState.kind === "submitting",
									children: t("cancel")
								})]
							}),
							submitState.kind === "ok" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: submitOkStyle,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, { size: 14 }),
									" ",
									t("skillAddOk"),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										style: {
											marginTop: 4,
											fontFamily: "ui-monospace, SFMono-Regular, monospace",
											fontSize: 11
										},
										children: submitState.path
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										style: { marginTop: 4 },
										children: submitState.note
									})
								]
							}),
							submitState.kind === "validation" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: submitErrStyle,
								children: [
									t("fail"),
									": ",
									t("skillValidationErrors"),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
										style: {
											margin: "4px 0 0",
											paddingLeft: 16
										},
										children: submitState.errors.map((e, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [
											e.field,
											": ",
											e.message
										] }, i))
									})
								]
							}),
							submitState.kind === "error" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: submitErrStyle,
								children: [
									t("fail"),
									": ",
									submitState.code,
									submitState.reason !== void 0 ? ` — ${submitState.reason}` : ""
								]
							})
						]
					})]
				})
			] });
		}
		function SkillRow(props) {
			const [open, setOpen] = (0, react.useState)(false);
			const s = props.skill;
			const title = `${s.name} — ${s.parsed ? props.parsedLabel : props.brokenLabel} · ${s.bytes} ${props.bytesLabel}`;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.DisclosureRow, {
				icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
					state: s.parsed ? "done" : "warning",
					size: 8
				}),
				title,
				open,
				expandable: true,
				onToggle: () => setOpen((o) => !o),
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					style: {
						whiteSpace: "pre-wrap",
						margin: 0,
						color: "var(--dsh-color-text-secondary, #888)"
					},
					children: s.description
				})
			});
		}
		/**
		* One row in the "Connected Virtuoso" section. The session id is the
		* canonical handle the user passes to vcli with `--session`; the port is
		* what the local daemon is listening on (the bridge daemon listens on
		* each Virtuoso instance's port, not VB_PORT).
		*
		* The row is intentionally flat (not collapsible): the four fields are
		* short and the user benefits from seeing all the session metadata at a
		* glance. The `currentId` flag adds a "● active" marker when this is the
		* session that `vcli session current` would auto-select — useful when
		* multiple Virtuoso instances are running and the user wants to know
		* which one the next `vcli skill exec` will land on.
		*/
		function SessionRow(props) {
			const s = props.session;
			const isCurrent = props.currentId !== null && s.id !== void 0 && props.currentId === s.id;
			const title = s.id !== void 0 ? isCurrent ? `● ${s.id} — ${props.labels.active}` : s.id : "?";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: {
					padding: "6px 8px",
					borderLeft: `2px solid ${isCurrent ? "var(--dsh-color-accent, #4f8ef7)" : "transparent"}`,
					background: "var(--dsh-color-code-bg, rgba(127,127,127,0.04))",
					borderRadius: 3
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					style: {
						fontWeight: 600,
						color: isCurrent ? "var(--dsh-color-accent, #4f8ef7)" : "var(--dsh-color-text-primary, #fff)"
					},
					children: title
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						flexWrap: "wrap",
						gap: "4px 12px",
						fontSize: 12,
						color: "var(--dsh-color-text-secondary, #888)",
						marginTop: 2
					},
					children: [
						s.port !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
							props.labels.port,
							": ",
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: s.port })
						] }),
						s.host !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
							props.labels.host,
							": ",
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: s.host })
						] }),
						s.user !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
							props.labels.user,
							": ",
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: s.user })
						] }),
						s.created !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
							props.labels.started,
							": ",
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: s.created })
						] })
					]
				})]
			});
		}
		function InstallTab(props) {
			const t = props.t;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
					style: { margin: 0 },
					children: t("installTitle")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
					title: t("installFromCrates"),
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CodeBlock, {
						text: t("installFromCratesCommand"),
						onCopy: props.onCopy,
						copyState: props.copyState,
						copyLabel: t("copy"),
						copiedLabel: t("copied")
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
					title: t("installFromSource"),
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CodeBlock, {
						text: t("installFromSourceCommand"),
						onCopy: props.onCopy,
						copyState: props.copyState,
						copyLabel: t("copy"),
						copiedLabel: t("copied")
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Section, {
					title: t("installLoadBridge"),
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Hint, { text: t("installLoadBridgeHint") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CodeBlock, {
						text: t("installLoadBridgeCommand"),
						onCopy: props.onCopy,
						copyState: props.copyState,
						copyLabel: t("copy"),
						copiedLabel: t("copied")
					})]
				})
			] });
		}
		function CodeBlock(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: codeBlockStyle,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
					style: {
						margin: 0,
						whiteSpace: "pre-wrap",
						flex: 1
					},
					children: props.text
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "ghost",
					onClick: () => props.onCopy(props.text),
					icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCopyOutline16, { size: 14 }),
					children: props.copyState === "copied" ? props.copiedLabel : props.copyLabel
				})]
			});
		}
		function Panel(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				style: panelStyle,
				children: props.children
			});
		}
		function Row(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: rowStyle,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					style: rowLabelStyle,
					children: props.label
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					style: rowValueStyle,
					children: props.value
				})]
			});
		}
		function Hint(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				style: hintStyle,
				children: props.text
			});
		}
		function Section(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: sectionStyle,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", {
					style: sectionHeadingStyle,
					children: props.title
				}), props.children]
			});
		}
		function CallResult(props) {
			const stderrDisplay = props.outcome.stderr ? redactPaths(props.outcome.stderr) : "";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("pre", {
				style: callResultStyle,
				children: [
					"[",
					props.label,
					"] ",
					props.outcome.ok ? props.okLabel : props.failLabel,
					"\n",
					"exit=",
					String(props.outcome.code),
					" reason=",
					String(props.outcome.reason ?? "-"),
					" duration=",
					String(props.outcome.durationMs),
					"ms",
					stderrDisplay && `\nstderr: ${stderrDisplay}`
				]
			}), props.outcome.note !== void 0 && props.outcome.note !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				style: noteStyle,
				children: props.outcome.note
			})] });
		}
		const noteStyle = {
			margin: "4px 0 0",
			padding: "4px 8px",
			borderLeft: "2px solid var(--dsh-color-accent, #4f8ef7)",
			color: "var(--dsh-color-text-secondary, #888)",
			fontSize: 12,
			background: "var(--dsh-color-code-bg, rgba(127,127,127,0.04))"
		};
		const panelStyle = { padding: 16 };
		const rowStyle = {
			display: "flex",
			alignItems: "center",
			gap: 8,
			padding: "4px 0",
			borderBottom: "1px dashed var(--dsh-color-divider, rgba(127,127,127,0.15))"
		};
		const rowLabelStyle = {
			width: 200,
			color: "var(--dsh-color-text-secondary, #888)"
		};
		const rowValueStyle = {
			flex: 1,
			fontFamily: "ui-monospace, SFMono-Regular, monospace"
		};
		const hintStyle = {
			color: "var(--dsh-color-text-secondary, #888)",
			fontSize: 13,
			margin: "4px 0 8px"
		};
		const sectionStyle = { marginTop: 12 };
		const sectionHeadingStyle = {
			fontSize: 13,
			color: "var(--dsh-color-text-tertiary, #999)",
			textTransform: "uppercase",
			letterSpacing: "0.05em",
			margin: "16px 0 8px"
		};
		const codeBlockStyle = {
			display: "flex",
			alignItems: "center",
			gap: 8,
			background: "var(--dsh-color-code-bg, rgba(127,127,127,0.08))",
			padding: 8,
			borderRadius: 4
		};
		const callResultStyle = {
			...codeBlockStyle,
			whiteSpace: "pre-wrap",
			marginTop: 8
		};
		const inputStyle = {
			padding: "6px 8px",
			border: "1px solid var(--dsh-color-divider, rgba(127,127,127,0.3))",
			borderRadius: 4,
			background: "var(--dsh-color-input-bg, transparent)",
			color: "var(--dsh-color-text-primary, #fff)",
			fontFamily: "inherit",
			fontSize: 13,
			resize: "vertical"
		};
		const fieldLabelStyle = {
			fontSize: 12,
			color: "var(--dsh-color-text-secondary, #888)",
			fontWeight: 600
		};
		const submitOkStyle = {
			padding: 8,
			borderRadius: 4,
			background: "var(--dsh-color-success-bg, rgba(80,180,120,0.1))",
			color: "var(--dsh-color-text-primary, #fff)",
			fontSize: 13
		};
		const submitErrStyle = {
			padding: 8,
			borderRadius: 4,
			background: "var(--dsh-color-warning-bg, rgba(220,150,80,0.1))",
			color: "var(--dsh-color-text-primary, #fff)",
			fontSize: 13
		};
		//#endregion
		//#region src/client/SettingsCard.tsx
		/**
		* The plugin's card on the plugin configuration page (DSH rc.7+).
		*
		* It manages the plugin itself — version, status, quick link to the
		* section. The card's scope is deliberately narrow: this page is where a
		* user goes to deal with a plugin, and "is it installed, what version, go
		* open it" is the only thing anybody can act on without knowing how DSH
		* is put together.
		*
		* Mirrors dsh-market's SettingsCard structure: header row → DisclosureRow
		* → body. We don't ship a removal flow because the user's cordis.yml is
		* the authoritative source; this is a visibility card, not a mutator.
		*/
		function SettingsCard(props) {
			const t = props.t;
			const [status, setStatus] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)(null);
			const [open, setOpen] = (0, react.useState)(false);
			const refresh = (0, react.useCallback)(async () => {
				setError(null);
				try {
					const r = await fetch("/dsh-virtuoso/status", { credentials: "same-origin" });
					if (!r.ok) throw new Error(`HTTP ${r.status}`);
					const data = await r.json();
					setStatus(data);
				} catch (err) {
					setError(err.message);
				}
			}, []);
			(0, react.useEffect)(() => {
				refresh();
			}, [refresh]);
			const title = `dsh-virtuoso${status !== null ? ` v${status.pluginVersion}` : ""}`;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.DisclosureRow, {
				icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
					state: stateFor(status),
					size: 8
				}),
				title,
				open,
				expandable: true,
				onToggle: () => setOpen((o) => !o),
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: { padding: 8 },
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							style: {
								margin: "0 0 8px",
								color: "var(--dsh-color-text-secondary, #888)"
							},
							children: t("setCardDesc")
						}),
						error !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
							style: { color: "var(--dsh-color-warning, #c97)" },
							children: [
								t("fail"),
								": ",
								error
							]
						}),
						status === null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconLoadingOutline16, { size: 14 }),
						status !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ul", {
							style: {
								margin: 0,
								paddingLeft: 16
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: ["vcli binary: ", status.cli.hasBinary ? t("statusBinaryYes") : t("statusBinaryNo")] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [
									t("statusRemote"),
									": ",
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: status.cli.remoteHost ?? t("empty") })
								] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [
									t("statusProfile"),
									": ",
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: status.profile })
								] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: ["bundled skills: ", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: status.skills.length })] })
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							style: {
								marginTop: 12,
								display: "flex",
								gap: 8
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "ghost",
								onClick: () => void refresh(),
								icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutline14, { size: 14 }),
								children: t("refresh")
							})
						})
					]
				})
			});
		}
		function stateFor(status) {
			if (status === null) return "ongoing";
			return status.cli.hasBinary ? "done" : "warning";
		}
		//#endregion
		//#region src/client/index.ts
		/**
		* dsh-virtuoso client: registers a "Virtuoso" settings section rendering the
		* bundled-skill listing, the local `vcli` daemon health, and the tunnel
		* control buttons. The runtime shape is identical to dsh-market's client
		* entry: localize → slot inject → nested `slots.inject(settings.plugin.item)`.
		*
		* Built by tsdown into `client/client.js`; the only externals are react
		* and the @deepseek-ai/dsh-client-ui-primitives, both resolved from the
		* loader module table at runtime.
		*/
		const NS = "dsh-virtuoso";
		/**
		* Primitives this bundle relies on. Mirrors the dsh-market `REQUIRED_PRIMITIVES`
		* gate: on a host older than rc.6 the resolver returns undefined for these
		* named exports and rendering would throw. Returning the gaps lets apply()
		* skip registration for a clean downgrade rather than blanking the dialog.
		*/
		const REQUIRED_PRIMITIVES = [
			"Button",
			"DisclosureRow",
			"Tooltip",
			"Toast",
			"StateDot"
		];
		function missingPrimitives(mod, required = REQUIRED_PRIMITIVES) {
			return required.filter((name) => mod[name] === void 0);
		}
		const name = "dsh-virtuoso";
		const inject = [
			"slots",
			"locale",
			"theme"
		];
		function apply(ctx) {
			const gaps = missingPrimitives(_deepseek_ai_dsh_client_ui_primitives);
			if (gaps.length > 0) {
				console.warn("[dsh-virtuoso] host ui-primitives missing " + gaps.join(", ") + " — virtuoso section disabled (dsh web >= 0.1.0-rc.6 required)");
				return;
			}
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "dsh-virtuoso: dictionaries");
			const t = ctx.locale.bind(NS);
			let retireSection = null;
			ctx.slots.inject("settings.section", () => {
				const off = ctx.slots.register({
					name: "settings.section",
					id: "virtuoso",
					order: 50,
					label: () => t("nav"),
					locale: NS,
					inject: () => ({ t })
				}, () => (0, react.createElement)(VirtuosoSection, { t }));
				if (typeof off === "function") retireSection = off;
				return off;
			});
			ctx.inject(["settingsScope"], (scoped) => {
				scoped.slots.inject("settings.plugin.item", () => scoped.slots.register({
					name: "settings.plugin.item",
					key: NS,
					locale: NS,
					inject: () => ({ t })
				}, () => (0, react.createElement)(SettingsCard, {
					t,
					onRemoved: () => {
						const off = retireSection;
						retireSection = null;
						off?.();
					}
				})));
			});
		}
		//#endregion
		exports.REQUIRED_PRIMITIVES = REQUIRED_PRIMITIVES;
		exports.apply = apply;
		exports.inject = inject;
		exports.missingPrimitives = missingPrimitives;
		exports.name = name;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map