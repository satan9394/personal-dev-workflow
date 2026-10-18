# 落位与分发流程（Skill → 丙区读取位 → 四个 agent → 项目副本）

> 本文件是**操作手册**：以后做"更新 skill / 挂到某个 agent / 升级某个项目里的副本"这类事，
> 按本文件执行，不要每次重新讨论口径。方针依据见 `Notes/DECISIONS.md` 的 D-0081（落位定案）、
> D-0082（执行细则）与 D-0085（丙区取代库 + 1.3.3 适配）；治理规则见仓库根 `AGENTS.md`。
> 最后核对日期：2026-10-17（晚）。

## 1. 四层职责（唯一权威只有一处）

```
本仓库 skills/personal-dev-workflow/            ← 唯一开发位与权威内容（agent 不直接读它）
        │  push 到 GitHub `main`（无库、无 deploy 命令）；丙区从 main 取远端刷新
        ▼
~\.agents_four_skills\personal-dev-workflow     ← 丙区读取位：**唯一使用位**（GitHub `main` 的本地镜像；2026-10-17 起取代 skills-manager 库）
        │  oc：~\.config\opencode\opencode.json 的 `skills` 数组原生注册这个目录
        │  dsh：web profile 的 `skill-filesystem.customSkillDirs` 原生注册这个目录
        │  cc / agy：没有该配置，按需直接读 <名>\SKILL.md
        ▼
<项目>/.agents/skills/personal-dev-workflow/    ← 项目级独立副本（长期项目需要时复制）
```

- **丙区（`~\.agents_four_skills\`）是本技能唯一的读取位**（权威内容仍是 GitHub `main` 的子路径
  `skills/personal-dev-workflow/`，丙区只是它的本地镜像，见 §5、§7），而且是**一个根承载四个 agent**：
  OpenCode 与 DSH 各自在配置里**原生注册**这一个目录（oc: `opencode.json#skills`；dsh: web profile 的
  `skill-filesystem.customSkillDirs`，独立提供方 `personal-filesystem`）；**cc 与 agy 没有该配置，按需直接读
  `~/.agents_four_skills/<名>/SKILL.md`**。
- **不再用 junction 挂载**：四个 agent 技能根（`~\.claude\skills`、`~\.dsh\skills`、`~\.gemini\antigravity\skills`、
  `~\.codex\skills`）里的丙区 junction 已于 2026-10-17 全部清掉（16 条，进回收站）；不要再建。
- **Codex 不读 skill，不在四者之内**：`~\.codex\skills` 与本方案无关。
- **甲（星标库 `stars-scan`）与乙（skills-manager `~\.skills-manager\skills`）都不碰丙区**；本技能已从
  skills-manager 库移除（`skills show personal-dev-workflow` 返回空），因此 `skills update` / `skills deploy` /
  `skills set-source` **对本技能不再适用**。
- 丙区新增或重命名技能，只需同步名册 `stars-scan\curated\personal-skills.json`（**不再需要建 junction**）；
  边界全文见本地治理目录的 `SKILL-BOUNDARIES-AGENTS-FOUR-SKILLS.md`。
- 改内容只改仓库那份；丙区镜像由"push 后再取远端"刷新（§5），项目副本由"复制"刷新，**不手工编辑丙区**。

## 2. 版本口径

- 发布号 = `package.json` 的 `version`（现 `2.0.1`，**不再变动**）；研究版 = `pdwSkillVersion`（现 `1.3.3-local`）。
- **不发版本**：不打 tag、不发 GitHub Release、不推 npm；分发口径 = `main` 滚动（见 `RELEASING.md`）。
- Skill `SKILL.md` frontmatter **只有 `name` + `description`**（skill-creator 规则），正文写研究版。
- 校验器口径：源版本比 `pdwSkillVersion`，发布号比 `package.json`。

## 3. 与研究发布包的关系（**以研究包为准**，2026-10-17 起）

研究项目（下文记作 `<research-repo>`）是上游，交付包在 `artifacts/releases/<version>/`
（ZIP + `manifest.json`，逐文件 SHA-256）。当前上游版本 = **`1.3.3-local`**。

- **规则：以研究包为准做适配**（2026-10-17 用户口径，取代先前"只作对照基准、不覆盖"）。
  适配 = 包内容原样落地 + **只保留仓库布局所必需的改动**：
  1. `scripts/drivers.test.mjs`、`scripts/pdw.test.mjs` 各一处路径探测（仓库布局 3 层 / 安装布局 4 层），
     否则测试会把证据写进 `<projects-root>/.pdw`；
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

### 步骤 1 · 适配上游包并刷新丙区读取位

```powershell
# 1) 解包上游（以 1.3.3-local 为例）
$tmp = "$env:TEMP\opencode\p133"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
tar -xf "<research-repo>/artifacts/releases/1.3.3-local/personal-dev-workflow-1.3.3-local.zip" -C $tmp
# 2) 备份现有仓库副本（可回溯，不放回收站就算备份）
$bak = ".pdw\skill-adaptation-<日期>\pre-package-baseline"
New-Item -ItemType Directory -Force -Path $bak | Out-Null; Copy-Item 'skills\personal-dev-workflow\*' $bak -Recurse -Force
# 3) 覆盖；随后只补两处布局探测（pdw.test.mjs / drivers.test.mjs），并把行尾统一成 LF
Copy-Item "$tmp\personal-dev-workflow\*" 'skills\personal-dev-workflow' -Recurse -Force
# 4) 抬研究版：package.json 的 pdwSkillVersion + 两处正文串（SKILL.md 正文、scripts/pdw.mjs 的 const version）
# 5) 跑步骤 0 的五条校验，再刷新丙区读取位
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

丙区读取位 `~\.agents_four_skills\personal-dev-workflow` 被**一个根**承载；**四个 agent 的读法定义在 §1，此处只记配置位置**：

| agent | 读法 | 配置位置 |
| --- | --- | --- |
| OpenCode | 原生注册这个目录 | `~/.config/opencode/opencode.json` → `"skills": ["~/.agents_four_skills"]` |
| DeepSeek Harness | 原生注册这个目录 | web profile `cordis.patch.yml` → `skill-filesystem.customSkillDirs: ['~/.agents_four_skills']`（提供方 `personal-filesystem`） |
| Claude Code | **按需直接读** `<名>\SKILL.md` | 无该配置 |
| Antigravity | **按需直接读** `<名>\SKILL.md` | 无该配置 |

- **Codex 不读 skill，不在四者之内**（`~\.codex\skills` 与本方案无关）。
- **不要建 junction**（规则与理由见 §1）：新增/改名技能只需同步名册 `stars-scan\curated\personal-skills.json`。
- 验证：`Get-Content ~\.config\opencode\opencode.json | Select-String agents_four_skills` 与
  `Select-String <dsh web profile>\cordis.patch.yml -Pattern customSkillDirs -Context 0,2` 都应命中丙区路径；
  再确认四个技能根里 `LinkType` 指向丙区的条目数为 **0**。
- 本技能已不在 skills-manager 库里：**不要**再用 `skills update` / `skills deploy` / `npx skills add` 处理它。

### 步骤 3 · 项目级副本升级（长期项目）

项目级是**独立副本**，skills-manager 的命令（含 `skills deploy`，它只写各 agent 的全局目录）管不到它，
由 skill 自带机制或人工复制负责。

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
4. 装入新版：从**源**（GitHub `main` 子路径，或本机丙区镜像，见 §7）逐文件复制全部 8 个文件（保留 `agents/`、`assets/`、`references/`、`scripts/` 四层）；
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

- 逐文件散列：仓库 `skills/personal-dev-workflow/` 与丙区读取位读到的 8 个文件应逐字节一致（行尾均为 LF）。
- 项目副本：8 文件与丙区一致 + 该项目 `.pdw/config.json` 前后哈希不变 + doctor 通过。
- **能证明的边界**：文件层与配置层可证；客户端里"skill 究竟有没有被列出/加载"要各自打开一次才算实测——
  OpenCode 可用 `opencode api get /api/skill` 复算，DSH 需在其会话里确认。2026-10-17 用户决定本轮不做客户端实测，
  因此 oc/dsh 两处仅"配置层已验证"，客户端层是**已知未验项**（不是已验证）；cc/agy 按设计就是按需直读。

### 步骤 5 · 记录

- 跨会话日记：本地治理笔记的当天日记文件（追加，不新建文件）。
- 会约束未来的决定：本地治理笔记的 `Notes/DECISIONS.md` 追加一条（取当前最大号 +1）。
- 机器清单有变动时同步本文件第 5 节。

## 5. 使用位与本机信息（2026-10-17 晚）

**本机曾配置的读取位与项目副本清单属本机信息，见本地治理笔记**；本节只保留中性口径与可迁移的流程教训。

**使用位 = 丙区，且只有这一个根**：读取位 `~\.agents_four_skills\personal-dev-workflow`（当前 `1.3.3-local` 内容 + 两处布局探测），**它是 GitHub `main` 的本地镜像，不是独立真身**（见下）。
项目级同步源与此不同：见 §7（GitHub main）；**四个 agent 的读法定义见 §1，此处不重复**。
**不再有 junction**：四个 agent 技能根里指向丙区的链接已于 2026-10-17 全部清掉（进回收站），四个根下的丙区条目数现为 **0**。仓库与丙区两份 **8/8 逐字节一致、行尾全 LF**。
本技能已从 skills-manager 库移除；dsh 原来的 2.0.0 真副本备份在本仓库
`.pdw/migrations/dsh-skill-copy-2.0.0-20261017/`（已进回收站）。

**丙区定位 = GitHub `main` 的本地镜像/读取位**（2026-10-17 定）：丙区那 8 个文件的权威来源是
`https://github.com/satan9394/personal-dev-workflow` 的 `main` 分支子路径 `skills/personal-dev-workflow/`。
**不要把丙区当作独立真身去改**——要改技能本体只改本仓库的 `skills/personal-dev-workflow/`（第 6 节第 9 条），
丙区随"push 后再取远端"被动跟进。每次分发仓库 `push` 之后的刷新步骤（只读比对 → 有差异才覆盖）：

```powershell
# 1) 取远端权威内容（--depth 1，只取 main 最新）
$tmp = "$env:TEMP\pdw-gh-mirror"
# 目录已存在时先进回收站（删除铁律），或换一个新目录名
git clone --depth 1 --branch main https://github.com/satan9394/personal-dev-workflow $tmp
# 2) 逐文件比对 $tmp\skills\personal-dev-workflow\ 的 8 个文件与丙区（sha256 + 行尾 LF）
#    SKILL.md、agents/openai.yaml、assets/audit-task.json、references/runtime.md、
#    scripts/{drivers.mjs,drivers.test.mjs,pdw.mjs,pdw.test.mjs}
# 3) 无差异 → 什么都不改（不备份也不覆盖）；有差异才覆盖：
#    先把丙区现有 8 文件**复制**备份到本仓库 .pdw\skill-mirror-backup-<YYYYMMDD>\
#    （复制、不移动、不删除），再用远端内容整份覆盖丙区，行尾统一 LF，并保留四层目录结构
```

比对同时要看本仓库本地那份：基线是**三方一致**（GitHub `main` / 丙区 / 本仓库 `skills/personal-dev-workflow/`），
2026-10-17 实测 `8/8` 逐字节一致、行尾全 LF（SHA 前 10 位见步骤 1 的表）。

**项目级传播（2026-10-17 晚已完成）**：四处项目副本已刷到 `1.3.3-local`（方式见步骤 3；旧副本各自备份在
`.pdw/skill-upgrade-20261017/personal-dev-workflow-pre-1.3.3/`），四处 `doctor` 均 `exit 0`、5 角色 ready：
`finquant-hub`、`Vessel_Harness`、`model-infra-kit`、`remote-job-aggregator`（研究项目那份是研究侧快照，不动）。
**注意**：`remote-job-aggregator` 当时有任务在跑（`20261018025316-f47696`，running/review，`run.lock` 里 pid 存活），
且其 `.pdw/tasks` 已从 12 涨到 **21** 个目录——刷新只改了 git 不可见的位置（`.agents/`、`AGENTS.md` 均在其
`.git/info/exclude` 里），所以没有制造 drift；但**在有任务运行时替换技能副本仍属边界操作**，以后先查 `run.lock`。
另外丙区里 `tmux-persist`、`utilities`、`agent-risk-guard` 与本技能无关，别顺手改。

项目级真副本（2026-10-17 已从 1.3.1-local 升级到当轮的 8 文件版本，逐文件与当时的源一致，各项目 `.pdw/config.json` 未被改动）。各项目副本的绝对路径、备份目录与升级前版本串属本机信息，见本地治理笔记。

升级后 `doctor` 结果：四个项目副本均 `exit 0`、5 角色 ready。其中两个项目初次 `exit 1`，原因是它们 `.pdw/config.json` 里 `implement` 的 codex 可执行文件指向已消失的版本化 bin 目录——这是升级前既有的项目配置漂移（用旧副本跑同一命令同样 `exit 1`），**不是**替换引入的；经用户授权先备份 `config.json`，再改指实测可用的版本目录，`doctor` 恢复 `exit 0`。
另有一个项目把长期残留的旧代际 `.agents/` 索引与工作树对齐并提交（只含 `.agents/`，**未推送**）；该项目 `.pdw/tasks` 为 0，HEAD 变化不会打到在跑任务。

各项目文档里钉扎的版本串同轮按"改现行描述、历史不动"更新：finquant-hub 的 `AGENTS.md` / `CLAUDE.md` /
`.gitignore` 注释、Vessel_Harness 的 `pdw-entry` 块、model-infra-kit 的 `AGENTS.md` 与 `.agents/skills/README.md`
已改到 `1.3.2-local`（当轮的上一版；2026-10-17 晚项目副本再刷到 `1.3.3-local` 后，这些现行版本串需按同口径跟进为
`1.3.3-local`——本轮只做文档归一化，未逐项复核各项目文档）；历史/证据类文件（`HANDOFF.md`、`CHANGELOG.md`、`evidence/**`、`docs/decisions.md`、
model-infra-kit `AGENTS.md` 里那条带日期的 2026-10-16 验证记录）保持原样。

另有一处是**首次装入**而非升级（2026-10-17）：`<projects-root>/remote-job-aggregator`
原本没有任何内嵌副本，也没有 `AGENTS.md` / `pdw.ps1`（它的 12 个 PDW 历史任务是靠外部路径跑的）。
按首次装入路径执行 `node <源>/scripts/pdw.mjs install --project <项目>`（源用本仓库或丙区镜像，见 §7），得到：8 文件副本、项目根 `pdw.ps1`、
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

- 研究项目里的那份冻结快照副本（研究侧快照，非使用位）。
- 某一内嵌项目的旧代际副本（v1.0.0 结构，27 文件，非 git，留作老代际存档）。
- 本机的备份仓与恢复备份目录（含日期快照、agent 配置的 git 仓库、压缩包，由各自的 Backup/GitCommit/Pack 脚本维护）。
- 各项目 `.pdw/`、`artifacts/`、`evidence/` 下的历史副本（测试证据，非使用位）。

## 6. 不变式与禁区

1. **不提交、不推送、不发布**，除非用户当轮明确授权。
2. **删除一律进回收站**（`FileSystem::DeleteFile/DeleteDirectory ... SendToRecycleBin` 或回收站工具），禁止 `rm` / `Remove-Item` / `rmdir` 等彻底删除。
3. **不覆盖项目级 `.pdw/config.json`**（角色、模型、exe 路径是项目自己的）。
4. 不动研究冻结快照、备份仓、老代际存档（见第 5 节）。
5. 不用 legacy 的 `skills sync`（按 active preset 批量刷所有 agent，会顺手动别的部署）。
6. 禁止 `npx skills add`（本机使用位是丙区读取位，不走包安装器）；本技能的写入链只有两条：**仓库 →（push 到 GitHub `main` →）丙区镜像**与**仓库 → 项目副本（复制）**。
7. 丙区读取位与项目副本出现 `.bak` / 临时文件时先清掉再复制（否则会被一起带进去）。
8. **丙区是共用位**：改本技能时只动 `~\.agents_four_skills\personal-dev-workflow`，不要碰同目录的 `tmux-persist` / `utilities` / `agent-risk-guard`；**不要建 junction**（oc/dsh 原生注册、cc/agy 按需直读），新增或改名技能只同步名册 `stars-scan\curated\personal-skills.json`。
9. 只在 `skills/personal-dev-workflow/` 里改 Skill 本体；不放插件、不生成派生副本（`AGENTS.md` 的「产物范围」）。

## 7. 项目级默认配置（2026-10-17 固定，**勿擅改**）

每个长期项目里那份副本的固定形态：

- 位置：`<项目>/.agents/skills/personal-dev-workflow/`，内容 = 源（GitHub `main`）的 8 文件，**逐字节一致、行尾 LF**；
- 项目自己的 `.pdw/config.json` **保持不动**（角色/模型/exe 路径属项目）；
- 项目 `AGENTS.md` 里有 **`<!-- pdw-skill-sync -->` 块**，写明唯一技能源与"更"的执行流程。

**唯一技能源**：GitHub `satan9394/personal-dev-workflow` 的 `main`（子路径 `skills/personal-dev-workflow/`）；本机丙区 `~\.agents_four_skills\personal-dev-workflow` 只是**离线镜像/兜底**，版本串须与远端一致（丙区镜像的刷新步骤见 §5，不重复）。

**用户说「更」/「更新 skill」时**（已逐字写进各项目 `AGENTS.md`）：

1. 取远端到临时目录：`git clone --depth 1 --branch main https://github.com/satan9394/personal-dev-workflow <临时目录>`，
   再逐文件比 `sha256(远端 8 文件)` 与 `sha256(本地副本)`（8 个；缺文件也算差异）；
   网络不可用才退回本地镜像，并在报告里说明；
2. 无差异 → 只回一句「已是最新（<版本>）」，不改任何文件；
3. 有差异 → 备份本地副本到 `.pdw/skill-upgrade-<YYYYMMDD>/` → 用源 8 文件整份替换
   （保留 `agents/ assets/ references/ scripts/` 四层）→ **不动 `.pdw/config.json`** →
   跑 `node .agents/skills/personal-dev-workflow/scripts/pdw.mjs doctor --project <项目根>` → 报告版本串与 doctor 结果。

已按此固定配置的项目（2026-10-17，均 `1.3.3-local`、`doctor exit 0`）：
`finquant-hub`、`Vessel_Harness`、`model-infra-kit`、`remote-job-aggregator`。

**换配置的条件**：只在用户明确要求时（换源、换布局、换备份位置等）；换完同步更新本节、各项目的
`pdw-skill-sync` 块与 `CHANGELOG.md`。

### 7.1 思考深度（effort）口径（2026-10-17）

- **档位由模型自身定义**，本机唯一依据是 TUI 状态文件 `~\.local\state\opencode\model.json#variant`
  （哪个模型支持哪几档、默认第几档，以它为准）；**别照抄别处**（别沿用别的 agent / 别的文档里的档位说法）。
- 角色里写 **`reasoning_effort`**（如 `"high"`）或 **`model#variant`**（如 `"…flash#max"`）**二选一**，**别同时写**。
- 2026-10-17 固定的默认：**`roles.review` 钉该模型可用的最高档**——
  `commandgota/deepseek/deepseek-v4.1-flash`（`finquant-hub`）→ `max`；
  `workbuddy/deepseek-v4.1-flash`（`Vessel_Harness` / `model-infra-kit` / `remote-job-aggregator`）→ `high`（该模型只到 `high`）。
- **`scan` / `test-plan` / `implement` / `planner` 保持原状**（host-default 或既有的 `medium`），本口径不涉及。
- **换档属项目级 config 变更**，按本节口径需**用户明确要求**；改前把 `<项目>\.pdw\config.json` 备份到
  `<项目>\.pdw\skill-upgrade-<YYYYMMDD>\config.json.bak-effort-<YYYYMMDD>`，改后跑
  `node <项目>/.agents/skills/personal-dev-workflow/scripts/pdw.mjs doctor --project <项目根>` 复核。
- 落地证据（2026-10-17）：上述四处 `review` 已钉档、备份如上，四处 `doctor` 均 `exit 0`。
