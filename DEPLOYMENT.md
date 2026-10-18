# 落位与分发流程（Skill → 丙区真身 → 四个 agent → 项目副本）

> 本文件是**操作手册**：以后做"更新 skill / 挂到某个 agent / 升级某个项目里的副本"这类事，
> 按本文件执行，不要每次重新讨论口径。方针依据见 `Notes/DECISIONS.md` 的 D-0081（落位定案）、
> D-0082（执行细则）与 D-0085（丙区取代库 + 1.3.3 适配）；治理规则见仓库根 `AGENTS.md`。
> 最后核对日期：2026-10-17（晚）。

## 1. 四层职责（唯一权威只有一处）

```
本仓库 skills/personal-dev-workflow/            ← 唯一开发位与权威内容（agent 不直接读它）
        │  直接复制（无库、无 deploy 命令）
        ▼
~\.agents_four_skills\personal-dev-workflow     ← 丙区真身：**唯一使用位**（2026-10-17 起取代 skills-manager 库）
        │  oc：~\.config\opencode\opencode.json 的 `skills` 数组原生注册这个目录
        │  dsh：web profile 的 `skill-filesystem.customSkillDirs` 原生注册这个目录
        │  cc / agy：没有该配置，按需直接读 <名>\SKILL.md
        ▼
<项目>/.agents/skills/personal-dev-workflow/    ← 项目级真副本（长期项目需要时复制）
```

- **丙区（`~\.agents_four_skills\`）是本技能唯一的使用位真身**，而且是**一个根承载四个 agent**：
  OpenCode 与 DSH 各自在配置里**原生注册**这一个目录（oc: `opencode.json#skills`；dsh: web profile 的
  `skill-filesystem.customSkillDirs`，独立提供方 `personal-filesystem`）；**cc 与 agy 没有该配置，按需直接读
  `<home>\.agents_four_skills\<名>\SKILL.md`**。
- **不再用 junction 挂载**：四个 agent 技能根（`~\.claude\skills`、`~\.dsh\skills`、`~\.gemini\antigravity\skills`、
  `~\.codex\skills`）里的丙区 junction 已于 2026-10-17 全部清掉（16 条，进回收站）；不要再建。
- **Codex 不读 skill，不在四者之内**：`~\.codex\skills` 与本方案无关。
- **甲（星标库 `stars-scan`）与乙（skills-manager `~\.skills-manager\skills`）都不碰丙区**；本技能已从
  skills-manager 库移除（`skills show personal-dev-workflow` 返回空），因此 `skills update` / `skills deploy` /
  `skills set-source` **对本技能不再适用**。
- 丙区新增或重命名技能，只需同步名册 `stars-scan\curated\personal-skills.json`（**不再需要建 junction**）；
  边界全文见 `<claude-code-root>\skills-governance\SKILL-BOUNDARIES-AGENTS-FOUR-SKILLS.md`。
- 改内容只改仓库那份；丙区与项目副本都由"复制"刷新，**不手工编辑丙区**。

## 2. 版本口径

- 发布号 = `package.json` 的 `version`（现 `2.0.1`，**不再变动**）；研究版 = `pdwSkillVersion`（现 `1.3.3-local`）。
- **不发版本**：不打 tag、不发 GitHub Release、不推 npm；分发口径 = `main` 滚动（见 `RELEASING.md`）。
- Skill `SKILL.md` frontmatter **只有 `name` + `description`**（skill-creator 规则），正文写研究版。
- 校验器口径：源版本比 `pdwSkillVersion`，发布号比 `package.json`。

## 3. 与研究发布包的关系（**以研究包为准**，2026-10-17 起）

研究项目 `<research-repo>` 是上游，交付包在 `artifacts/releases/<version>/`
（ZIP + `manifest.json`，逐文件 SHA-256）。当前上游版本 = **`1.3.3-local`**。

- **规则：以研究包为准做适配**（2026-10-17 用户口径，取代先前"只作对照基准、不覆盖"）。
  适配 = 包内容原样落地 + **只保留仓库布局所必需的改动**：
  1. `scripts/drivers.test.mjs`、`scripts/pdw.test.mjs` 各一处路径探测（仓库布局 3 层 / 安装布局 4 层），
     否则测试会把证据写进 `<projects-root>\.pdw`；
  2. 行尾统一 LF（包内 `scripts/pdw.mjs` 是 CRLF，仓库 `.gitattributes` 规定 `*.mjs eol=lf`）。
- **随之退场的下游改动**（本仓库 2026-10-16/17 原有、研究包未携带）：`drivers.mjs` 的角色 JSON 恢复
  （`jsonValues` / 围栏 / 平衡花括号）、`drivers.test.mjs` 的对应回归用例、`references/runtime.md` 的最终响应口径段落。
  旧 8 文件备份在 `.pdw/skill-adaptation-20261017/pre-package-baseline/`，可回溯。
- 这类能力若要保留，应在**研究项目**里实现并出新包，再同步过来，而不是在本仓库反向补丁。
- 核实时做**文件级比对**：按 `manifest.json` 的 sha256 逐文件比仓库/丙区，再对差异文件做行级 diff。
- 比对与适配结论写进 `.pdw/`（本地证据，gitignore），不往仓库塞跨仓库脚本。

## 4. 标准更新流程

### 步骤 0 · 前置检查（只读）

```powershell
cd <repo>
git status --short
node scripts/validate-skills.mjs
node --test scripts/validate-skills.test.mjs
node --test skills/personal-dev-workflow/scripts/drivers.test.mjs
node skills/personal-dev-workflow/scripts/pdw.test.mjs
node archive/tools/run-tests.mjs
```

全绿再往下。

### 步骤 1 · 适配上游包并刷新丙区真身

```powershell
# 1) 解包上游（以 1.3.3-local 为例）
$tmp = "$env:TEMP\opencode\p133"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
tar -xf "<research-repo>\artifacts\releases\1.3.3-local\personal-dev-workflow-1.3.3-local.zip" -C $tmp
# 2) 备份现有仓库副本（可回溯，不放回收站就算备份）
$bak = ".pdw\skill-adaptation-<日期>\pre-package-baseline"
New-Item -ItemType Directory -Force -Path $bak | Out-Null; Copy-Item 'skills\personal-dev-workflow\*' $bak -Recurse -Force
# 3) 覆盖；随后只补两处布局探测（pdw.test.mjs / drivers.test.mjs），并把行尾统一成 LF
Copy-Item "$tmp\personal-dev-workflow\*" 'skills\personal-dev-workflow' -Recurse -Force
# 4) 抬研究版：package.json 的 pdwSkillVersion + 三处正文串（SKILL.md、references/runtime.md 标题、scripts/pdw.mjs 的 const version）
# 5) 跑步骤 0 的五条校验，再刷新丙区真身
Copy-Item 'skills\personal-dev-workflow\*' "$env:USERPROFILE\.agents_four_skills\personal-dev-workflow" -Recurse -Force
```

参考值（2026-10-17，`1.3.3-local`；内容变动时同步更新）：

| 文件 | 上游 1.3.3 包 | 本项目 / 丙区 |
| --- | --- | --- |
| SKILL.md | `a33440fb…` | 同（未改） |
| agents/openai.yaml | `f8cfe876…` | 同（未改） |
| assets/audit-task.json | `fe2d91b6…` | 同（未改） |
| references/runtime.md | `744dbe7f…` | 同（未改） |
| scripts/drivers.mjs | `4821702b…` | 同（仅行尾 LF） |
| scripts/pdw.mjs | `d52f2c45…` | 同（仅行尾 CRLF→LF） |
| scripts/drivers.test.mjs | `dc6ecbc0…` | 改一处（仓库布局探测） |
| scripts/pdw.test.mjs | `6e5eccfe…` | 改一处（仓库布局探测） |

### 步骤 2 · 四个 agent 的使用位（丙区原生注册，**不用 junction**）

丙区真身 `~\.agents_four_skills\personal-dev-workflow` 被**一个根**承载，四个 agent 这样拿到它：

| agent | 读法 | 配置位置 |
| --- | --- | --- |
| OpenCode | 原生注册这个目录 | `~\.config\opencode\opencode.json` → `"skills": ["C:\\Users\\<user>\\.agents_four_skills"]` |
| DeepSeek Harness | 原生注册这个目录 | web profile `cordis.patch.yml` → `skill-filesystem.customSkillDirs: ['<home>\.agents_four_skills']`（提供方 `personal-filesystem`） |
| Claude Code | **按需直接读** `<名>\SKILL.md` | 无该配置 |
| Antigravity | **按需直接读** `<名>\SKILL.md` | 无该配置 |

- **Codex 不读 skill，不在四者之内**（`~\.codex\skills` 与本方案无关）。
- **不要建 junction**：四个 agent 技能根里的丙区 junction 已于 2026-10-17 全部清掉（16 条，进回收站）；
  新增/改名技能只需同步名册 `stars-scan\curated\personal-skills.json`。
- 验证：`Get-Content ~\.config\opencode\opencode.json | Select-String agents_four_skills` 与
  `Select-String <dsh web profile>\cordis.patch.yml -Pattern customSkillDirs -Context 0,2` 都应命中丙区路径；
  再确认四个技能根里 `LinkType` 指向丙区的条目数为 **0**。
- 本技能已不在 skills-manager 库里：**不要**再用 `skills update` / `skills deploy` / `npx skills add` 处理它。

### 步骤 3 · 项目级副本升级（长期项目）

项目级是**真副本**，`skills deploy` 管不到（它只写各 agent 的全局目录），由 skill 自带机制或人工复制负责。

```powershell
# 新项目首次装入：把整份复制到 <项目>/.agents/skills/personal-dev-workflow
node <skill>/scripts/pdw.mjs install --project <项目绝对路径>
```

`install` 只用于**新项目首次装入**。升级已有副本时**不要**跑它——同名副本已存在它本就拒绝，
而且它还有连带副作用：写项目根 `pdw.ps1`、往项目 `AGENTS.md` 追加 `<!-- pdw-entry -->` 标记、跑 `initialize`。
升级按这个顺序做（只动技能目录，不碰项目的 `.pdw/`、`pdw.ps1`、`AGENTS.md`）：

1. 备份旧副本（进 `.pdw/skill-upgrade-<日期>/` 或项目自己的证据位，不放回收站就算备份）；
2. 对比：确认旧副本是否有项目本地改动（与原发布包逐文件散列比），有则单独保存差异；
3. 移走旧目录（**回收站**，不彻底删除）；
4. 装入新版：从**库**逐文件复制全部 8 个文件（保留 `agents/`、`assets/`、`references/`、`scripts/` 四层）；
5. **保留项目自己的 `.pdw/config.json`**——里面是该项目的角色/模型/可执行文件路径，属项目级设置，
   任何情况下不得用默认值覆盖；
6. 跑 `node <skill>/scripts/pdw.mjs doctor --project <项目>` 复核，证据留在该项目的 `.pdw/`；
7. 该项目的 `AGENTS.md` 若描述了技能目录内容（文件清单、references 名称），随代际变化同步更新。

### 步骤 4 · 验证

```powershell
# 1) 两个原生注册点仍在
Select-String "$env:USERPROFILE\.config\opencode\opencode.json" -Pattern agents_four_skills
Select-String "$env:USERPROFILE\.dsh\profiles\web\cordis.patch.yml" -Pattern customSkillDirs -Context 0,2
# 2) 四个技能根里不应再有指向丙区的链接（应全为 0）
foreach ($r in '~\.claude\skills','~\.dsh\skills','~\.gemini\antigravity\skills','~\.codex\skills') { @(Get-ChildItem $r -Force | Where-Object LinkType | Where-Object { $_.Target -like '*\.agents_four_skills\*' }).Count }
# 3) 仓库与丙区逐文件散列一致
```

- 逐文件散列：仓库 `skills/personal-dev-workflow/` 与丙区真身读到的 8 个文件应逐字节一致（行尾均为 LF）。
- 项目副本：8 文件与丙区一致 + 该项目 `.pdw/config.json` 前后哈希不变 + doctor 通过。
- **能证明的边界**：文件层与配置层可证；客户端里"skill 究竟有没有被列出/加载"要各自打开一次才算实测——
  OpenCode 可用 `opencode api get /api/skill` 复算，DSH 需在其会话里确认。2026-10-17 用户决定本轮不做客户端实测，
  因此 oc/dsh 两处仅"配置层已验证"，客户端层是**已知未验项**（不是已验证）；cc/agy 按设计就是按需直读。

### 步骤 5 · 记录

- 跨会话日记：`<claude-code-root>\Notes\2026\10\NOTES_20261017.md`（追加，不新建文件）。
- 会约束未来的决定：`<claude-code-root>\Notes\DECISIONS.md` 追加一条（取当前最大号 +1）。
- 机器清单有变动时同步本文件第 5 节。

## 5. 机器现状（2026-10-17 晚实测）

**使用位 = 丙区，且只有这一个根**：真身 `~\.agents_four_skills\personal-dev-workflow`（当前 `1.3.3-local` 内容 + 两处布局探测）。
四个 agent 的读法：**OpenCode** 由 `~\.config\opencode\opencode.json#skills` 原生注册该目录；**DSH** 由 web profile 的
`skill-filesystem.customSkillDirs` 原生注册；**Claude Code 与 Antigravity 无该配置，按需直接读 `<名>\SKILL.md`**；
**Codex 不读 skill，不在四者之内**。**不再有 junction**：四个 agent 技能根里指向丙区的 16 条链接已于 2026-10-17 全部清掉
（进回收站），四个根下的丙区条目数现为 **0**。仓库与丙区两份 **8/8 逐字节一致、行尾全 LF**。
本技能已从 skills-manager 库移除；dsh 原来的 2.0.0 真副本备份在本仓库
`.pdw/migrations/dsh-skill-copy-2.0.0-20261017/`（已进回收站）。

**未完成的传播（重要）**：项目级真副本仍停在**上一版**（`1.3.2-local` + 已退场的下游修复），
尚未刷成本次的 `1.3.3-local`；待刷的四处为 `finquant-hub`、`Vessel_Harness`、`model-infra-kit`、
`remote-job-aggregator`（研究项目那份是研究侧快照，不动）。刷新方式见步骤 3；刷完各自跑 `doctor` 复核。
另外丙区里 `tmux-persist`、`utilities`、`agent-risk-guard` 与本技能无关，别顺手改。

项目级真副本（2026-10-17 早些时候已从 1.3.1-local 升级到「上一版 8 文件」，逐文件与当时的库一致，各自 `.pdw/config.json` 未被改动）：

| 项目 | 路径 | 备份 |
| --- | --- | --- |
| finquant-hub | `<projects-root>\finquant-hub\.agents\skills\personal-dev-workflow` | `<项目>\.pdw\skill-upgrade-20261017\personal-dev-workflow-1.3.1-local\` |
| Vessel_Harness | `<projects-root>\Vessel_Harness\.agents\skills\personal-dev-workflow` | 同上（各自项目内） |
| model-infra-kit | `<dsh-root>\workspace\2026_09_08\model-infra-kit\.agents\skills\personal-dev-workflow` | 同上（各自项目内） |

finquant-hub 另有一项收尾（2026-10-17 晚）：它的 `.agents/` 索引里长期残留 27 条 v1.0.0 旧路径，
已与工作树对齐并提交 `6c3ded7`（34 文件 +1468/−1093，**只含 `.agents/`**），**未推送**（本地 ahead 1，
远端 `refs/heads/main` 仍在 `e37ca46`）。该项目 `.pdw/tasks` 为 0，所以这次 HEAD 变化不会打到在跑任务。

升级后 `doctor` 结果：model-infra-kit `exit 0`（5 角色 ready）；finquant-hub 与 Vessel_Harness 初次 `exit 1`，
原因是这两个项目 `.pdw/config.json` 里 `implement` 的 codex 路径指向已消失的版本化 bin 目录
（`...\OpenAI\Codex\bin\e78bad9887fa50cf\codex.exe`）。这是升级前既有的项目配置漂移（用 1.3.1 旧副本跑同一命令
同样 exit 1），**不是**替换引入的。2026-10-17 经用户授权已修复：先备份 `config.json` 到各自的
`.pdw/skill-upgrade-20261017/`，再把 `implement.executable` 改指实测可用的 `...\bin\896a0166b774037a\codex.exe`
（同级 `ce4759538b7f2f1a\` 里只有 `rg.exe`，不是 codex），改后两份 `doctor` 均 `exit 0`、5 角色 ready。

各项目文档里钉扎的版本串同轮按"改现行描述、历史不动"更新：finquant-hub 的 `AGENTS.md` / `CLAUDE.md` /
`.gitignore` 注释、Vessel_Harness 的 `pdw-entry` 块、model-infra-kit 的 `AGENTS.md` 与 `.agents/skills/README.md`
已改到 `1.3.2-local`；历史/证据类文件（`HANDOFF.md`、`CHANGELOG.md`、`evidence/**`、`docs/decisions.md`、
model-infra-kit `AGENTS.md` 里那条带日期的 2026-10-16 验证记录）保持原样。

另有一处是**首次装入**而非升级（2026-10-17）：`<claude-code-root>\projects\remote-job-aggregator`
原本没有任何内嵌副本，也没有 `AGENTS.md` / `pdw.ps1`（它的 12 个 PDW 历史任务是靠外部路径跑的）。
按首次装入路径执行 `node <库>/scripts/pdw.mjs install --project <项目>`，得到：8 文件副本、项目根 `pdw.ps1`、
`AGENTS.md`（install 写的 `<!-- pdw-entry -->` 块 + 事后补的「PDW 入口与技能副本」「任务板一览」两节，现 2005 B / 25 行）；
`.pdw/config.json`（5 角色全 opencode）与 `.gitignore` 未被改动，`doctor` exit 0。

**这一处有个必须记住的坑（同日独立评审发现）**：该项目 `.agents/` **没有被 git 忽略**，而 PDW 的 `snapshot()`
把**全部 git 可见的未跟踪文件**（与契约 scope 无关）算进任务指纹，于是新装的 10 个文件（`.agents/**` 8 个 +
`AGENTS.md` + `pdw.ps1`）**改掉了该仓库每一个既有任务的指纹**——只有把这 10 个键剔除，
任务 `20261017071242-3b909d` 的指纹才与 `state.artifact` 精确相等；而 `runTask` 进 try 后第一件事是
`assertCurrent()`，所以这些任务的 `resume` 会被 `Source drift detected` 直接挡回。
2026-10-17 已按用户决定在它的 `.git/info/exclude` 本地忽略这三个路径（文件保留）。
**注意补救的边界**：忽略规则只救回"baseline 之后没有真实改动"的任务（实测 3 个里只有 `3b909d` 恢复
`evidence_current: true`）；`6629de` / `cf5a61` / `bb07f4` 仍为 false，是它们 baseline 之后确有真实内容变更。
**写进流程的教训**：给任何项目装/升级 skill 前，先确认该项目的 `.agents/`（以及新增的 `AGENTS.md` / `pdw.ps1`）
已被 git 忽略或已提交；否则会顺手改掉它所有 PDW 任务的指纹。对 0 个任务的 finquant-hub / Vessel_Harness 无影响，
但对"全未跟踪、尚无 commit"的仓库最脆。
**补充（2026-10-17 于 finquant-hub 实测）**：`snapshot()` 走 `git ls-files -c -o --exclude-standard`，
**索引里有、磁盘上已删的路径会被静默跳过**（`lstat` ENOENT → `continue`），所以"27 条旧索引条目 vs 8 个新文件"
这种半迁移状态**既不污染指纹也不报错**；真正进指纹的是**未跟踪且未忽略**的文件（finquant-hub 实测进 7 个）。
反过来有个必须避开的耦合：一旦有人把这些变更提交，**HEAD 会变**，正在跑的任务下次快照就会抛
`Git HEAD changed: commits are not authorized by this task` —— 所以"升级项目副本 / 整理 `.agents` 索引"
这类会产生提交的动作，要避开任务运行期。

另：`bb07f4` 的僵尸 `active`（pid 25588）已人工删除（备份 `.pdw/skill-upgrade-20261017/state-bb07f4.bak-20261017`）。

刻意不动：

- `<research-repo>\.agents\skills\personal-dev-workflow`——研究项目的 1.3.2-local 冻结快照。
- `<dsh-root>\workspace\2026_09_08\model-infra-kit-internal\.agents\skills\personal-dev-workflow`——v1.0.0 老代际（27 文件结构，非 git，2026-10-06 后未动），留作老代际存档。
- `E:\AI_ALL\Agent_备份\`——备份仓（22 直接子项 / 约 9.5 万文件 / 约 48.9 GB，含 10 个日期快照、`git-config` 五份 agent 配置的 git 仓库、zips），由它自己的 Backup/GitCommit/Pack 脚本维护。
- `<dsh-root>\_recovery\` 里的恢复备份，以及各处 `.pdw/`、`artifacts/`、`evidence/` 下的历史副本（测试证据，非使用位）。

## 6. 不变式与禁区

1. **不提交、不推送、不发布**，除非用户当轮明确授权。
2. **删除一律进回收站**（`FileSystem::DeleteFile/DeleteDirectory ... SendToRecycleBin` 或回收站工具），禁止 `rm` / `Remove-Item` / `rmdir` 等彻底删除。
3. **不覆盖项目级 `.pdw/config.json`**（角色、模型、exe 路径是项目自己的）。
4. 不动研究冻结快照、备份仓、老代际存档（见第 5 节）。
5. 不用 legacy 的 `skills sync`（按 active preset 批量刷所有 agent，会顺手动别的部署）。
6. 禁止 `npx skills add`（本机与丙区/junction 机制冲突）；本技能的写入链只有两条：**仓库 → 丙区（复制）**与**仓库 → 项目副本（复制）**。
7. 丙区真身与项目副本出现 `.bak` / 临时文件时先清掉再复制（否则会被一起带进去）。
8. **丙区是共用位**：改本技能时只动 `~\.agents_four_skills\personal-dev-workflow`，不要碰同目录的 `tmux-persist` / `utilities` / `agent-risk-guard`；**不要建 junction**（oc/dsh 原生注册、cc/agy 按需直读），新增或改名技能只同步名册 `stars-scan\curated\personal-skills.json`。
8. 只在 `skills/personal-dev-workflow/` 里改 Skill 本体；不放插件、不生成派生副本（`AGENTS.md` 的「产物范围」）。
