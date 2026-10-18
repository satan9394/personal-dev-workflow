# Personal Dev Workflow distribution

This repository maintains and distributes the iterated Skill. Workflow research and original evidence live in a separate research repository, referenced here as `<research-repo>`.

> 本机交接与机器清单不在公开仓库：见本地治理目录的 `pdw-HANDOFF-20261017-recut.md`。
> **最新本机交接（含本机路径、不入库）**：`.pdw/HANDOFF-20261017-recut.md` —— 新会话开工先读它（上一份 `.pdw/HANDOFF-20261017-final.md` 留档可查）。

## 文档地图（顶层 6 份，各读一份责任）

- `AGENTS.md` — 本仓库治理规则与产物范围 — 每次开工先读
- `README.md` — 对外介绍：它是什么、怎么装与驱动、边界与验证、仓库布局 — 改用法或对外说明时读
- `DEPLOYMENT.md` — 落位与分发操作手册（四层职责、版本口径、更新流程、使用位与本机信息、不变式） — 改使用位、升项目副本前必读
- `RELEASING.md` — 发布口径（`main` 滚动，不发版本）与推送步骤 — 提交 / 推送前读
- `CHANGELOG.md` — 逐条变更记录（`[main]` 滚动条目 + 历史版本；历史条目不改） — 想查"改了什么、为什么"时读
- `SECURITY.md` — 漏洞上报与披露政策 — 上报 / 披露安全问题时读

> **交接**：本机状态快照、待办与踩坑不在公开仓库，见本地治理目录的 `pdw-HANDOFF-20261017-recut.md`（早先的 `pdw-HANDOFF-20261017-opencode.md` / `pdw-HANDOFF-20261016-opencode.md` 留档可查）。插件与派生副本已移除（`plugin/`、`dist/`、`sync-copies.mjs`、npm 发布工作流），legacy 已整批归档到 `archive/`。

- 落位与分发（把 Skill 刷到**丙区** `~\.agents_four_skills\`、升级项目里的副本、与研究发布包的适配口径与验收清单）：按 **`DEPLOYMENT.md`** 执行，不要每次重新讨论口径。方针依据：本地治理笔记的 `Notes/DECISIONS.md` 的 D-0081（仓库=开发位、库=挂载开关、全局=受管链接、项目=按需复制）、D-0085（丙区取代库 + 1.3.3 适配）。**版本口径 = main 滚动，不发版本**（见 `RELEASING.md`）。

- **分发链**（技能内容的**权威来源是研究包** `<research-repo>/artifacts/releases/<version>/`，适配口径见 `DEPLOYMENT.md` §3；本仓库是适配与分发位，`skills/personal-dev-workflow/` 是唯一交付物）：研究包 → 本仓库 → GitHub `satan9394/personal-dev-workflow` 的 `main`（滚动）→ 丙区读取位 `~\.agents_four_skills\personal-dev-workflow`（oc 由 `opencode.json#skills`、dsh 由 `skill-filesystem.customSkillDirs` 原生注册；cc/agy 按需直读；Codex 不读 skill；**不用 junction**）→ 各长期项目 `.agents/skills/personal-dev-workflow/`（也可由技能自带 `scripts/update.mjs` 直接从 `main` 自更新）。步骤见 `DEPLOYMENT.md`。

- Edit only `skills/personal-dev-workflow/` as the canonical Skill. **This repository ships the Skill only**: the DSH plugin bundle and the generated copies were removed on 2026-10-16 on the user's instruction (a plugin is not a Skill), and `scripts/sync-copies.mjs` is retired. Do not reintroduce a plugin directory or a copy step.
- Follow skill-creator + the Agent Skills spec: frontmatter carries `name`/`description` plus the spec fields (`license`, `compatibility`, `metadata`, `allowed-tools`); the skill declares its origin in `metadata` (version/repository/skill-path/branch/updated). Claude Code-only fields such as `argument-hint` stay out because they break claude.ai upload. Display metadata goes in agents/openai.yaml; runtime details in references/; runnable tools in scripts/; templates in assets/. Keep release notes and repository evidence outside the Skill.
- `package.json.version` identifies the distribution. `pdwSkillVersion` and the Skill/runtime text identify the imported research version. Preserve documented downstream fixes.
- **New capability goes upstream first**: implement it in the research project, ship a new package (or re-cut one), then adapt it here per `DEPLOYMENT.md` step 1. This repository keeps exactly one local adaptation — the two repository-layout probes. When a package is re-cut under the same version string, compare copies by **per-file sha256**, never by the version string.
- Verify with `node scripts/validate-skills.mjs`, `node --test scripts/validate-skills.test.mjs`, `node --test skills/personal-dev-workflow/scripts/drivers.test.mjs`, `node skills/personal-dev-workflow/scripts/pdw.test.mjs`, and `node archive/tools/run-tests.mjs`. Fixture passes do not prove live authentication or provider routing.
- Keep `.pdw/` evidence/backups intact and leave the archived legacy material under `archive/` where it is; do not copy it back into the live tree. Do not copy transient backups into the Skill. No automatic commit, push, publish, release, global configuration changes or permanent deletion.

## 产物范围 / Scope（2026-10-16，用户指令）

- **本仓库只产出 Skill**：`skills/personal-dev-workflow/` 是唯一交付物。**不做 DSH 插件、不产任何派生副本**——插件 ≠ Skill。
- 2026-10-16 已移除：`plugin/`（含 `dsh-personal-dev-workflow` 插件与 `dsh-budget-gate`）、`dist/skillhub-pkg`、`scripts/sync-copies.mjs`；`validate-skills.mjs` 的副本校验与插件版本一致性校验、`validate-skills.test.mjs` 里对应的两个用例、CI 里那句"packaging"措辞一并去掉；`package.json` 的 `files` / `scripts` 不再提 plugin、dist、sync。
- 机理：**不再有副本，就不存在"canonical 与副本漂移"**，也不需要"暂停生成副本"这种临时状态。
- agent 侧不受影响：**丙区是唯一的使用位、一个根承载四个 agent**——OpenCode 由 `~\.config\opencode\opencode.json#skills` 原生注册、DSH 由 web profile 的 `skill-filesystem.customSkillDirs` 原生注册，Claude Code 与 Antigravity 无该配置、按需直接读 `<名>\SKILL.md`；**不再用 junction**，**Codex 不读 skill、不在四者之内**。本技能已从 skills-manager 库移除，`skills update` / `skills deploy` 对它不再适用（见 `DEPLOYMENT.md`）。
