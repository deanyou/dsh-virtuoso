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
			tunnelStart: "建立隧道",
			tunnelStop: "断开隧道",
			tunnelStatus: "Ping daemon",
			tunnelStarted: "已建立隧道",
			tunnelStopped: "已断开",
			tunnelPing: "daemon 已响应",
			tunnelPingFailed: "daemon 未响应",
			tunnelDisabledHint: "请先到 Settings → Plugins → Virtuoso integration 打开「允许隧道」开关",
			skillsTitle: "bundled agent skills",
			skillsHint: "vcli 的 18 个 agent skill 已随插件一并发布,DSH 的 skill-filesystem 会自动发现。",
			skillsParsed: "已解析",
			skillsBroken: "frontmatter 缺失",
			skillsBytes: "字节",
			installTitle: "安装 vcli",
			installFromCrates: "从 crates.io 安装(推荐)",
			installFromCratesCommand: "cargo install virtuoso-cli",
			installFromSource: "从源码安装",
			installFromSourceCommand: "git clone https://github.com/deanyou/virtuoso-cli.git\ncd virtuoso-cli\ncargo install --path .",
			installLoadBridge: "加载到 Virtuoso CIW",
			installLoadBridgeHint: "在 Virtuoso CIW 中执行 (可写入 ~/.cdsinit 以自动加载):",
			installLoadBridgeCommand: "load(\"/path/to/virtuoso-cli/resources/ramic_bridge.il\")",
			refresh: "刷新",
			copy: "复制命令",
			copied: "已复制",
			retry: "重试",
			cancel: "取消",
			empty: "(空)",
			ok: "正常",
			warn: "警告",
			fail: "失败"
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
			tunnelStart: "Start tunnel",
			tunnelStop: "Stop tunnel",
			tunnelStatus: "Ping daemon",
			tunnelStarted: "Tunnel started",
			tunnelStopped: "Tunnel stopped",
			tunnelPing: "daemon responded",
			tunnelPingFailed: "daemon did not respond",
			tunnelDisabledHint: "Enable the Allow-tunnel toggle under Settings → Plugins → Virtuoso integration first.",
			skillsTitle: "bundled agent skills",
			skillsHint: "The 18 virtuoso-cli agent skills ship with this plugin. DSH's skill-filesystem picks them up automatically.",
			skillsParsed: "parsed",
			skillsBroken: "missing frontmatter",
			skillsBytes: "bytes",
			installTitle: "Install vcli",
			installFromCrates: "Install from crates.io (recommended)",
			installFromCratesCommand: "cargo install virtuoso-cli",
			installFromSource: "Install from source",
			installFromSourceCommand: "git clone https://github.com/deanyou/virtuoso-cli.git\ncd virtuoso-cli\ncargo install --path .",
			installLoadBridge: "Load the bridge into Virtuoso CIW",
			installLoadBridgeHint: "Paste this in the CIW (also safe to add to ~/.cdsinit):",
			installLoadBridgeCommand: "load(\"/path/to/virtuoso-cli/resources/ramic_bridge.il\")",
			refresh: "Refresh",
			copy: "Copy command",
			copied: "Copied",
			retry: "Retry",
			cancel: "Cancel",
			empty: "(empty)",
			ok: "OK",
			warn: "warn",
			fail: "fail"
		};
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
			const [copyState, setCopyState] = (0, react.useState)("idle");
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
			(0, react.useEffect)(() => {
				refresh();
			}, [refresh]);
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
					refresh();
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
			}, [status, refresh]);
			const tunnelStop = (0, react.useCallback)(async () => {
				setTunnel("stopping");
				try {
					const outcome = await (await fetch("/dsh-virtuoso/tunnel/stop", {
						method: "POST",
						credentials: "same-origin"
					})).json();
					setTunnelOutcome(outcome);
					setTunnel(outcome.ok ? "ok" : "fail");
					refresh();
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
			}, [refresh]);
			const runPing = (0, react.useCallback)(async () => {
				setPing("pinging");
				try {
					const outcome = await (await fetch("/dsh-virtuoso/ping", {
						method: "POST",
						credentials: "same-origin"
					})).json();
					setPingOutcome(outcome);
					setPing(outcome.ok ? "ok" : "fail");
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
			}, []);
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
					onTunnelStart: tunnelStart,
					onTunnelStop: tunnelStop,
					onPing: runPing,
					onRefresh: () => void refresh()
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
			if (status === null && props.error === null) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "ongoing" }), " loading…"] });
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
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
						label: t("refresh"),
						side: "bottom",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "ghost",
							icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutline14, { size: 14 }),
							onClick: props.onRefresh
						})
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
					value: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: status.cli.remoteHost })
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
					children: "tunnel / daemon"
				}),
				tunnelDisabled && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Hint, { text: t("tunnelDisabledHint") }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						gap: 8
					},
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "primary",
							disabled: tunnelDisabled || props.tunnelPhase === "starting" || props.tunnelPhase === "stopping",
							onClick: props.onTunnelStart,
							icon: props.tunnelPhase === "starting" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconLoadingOutline16, { size: 14 }) : void 0,
							children: t("tunnelStart")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							disabled: !status.cli.hasBinary || props.tunnelPhase === "starting" || props.tunnelPhase === "stopping",
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
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("pre", {
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
					props.outcome.stderr && `\nstderr: ${props.outcome.stderr}`
				]
			});
		}
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
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: status.cli.remoteHost })
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