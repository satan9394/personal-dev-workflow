---
description: 文档事实核查：逐条对照文件、命令、版本与分发链（只读）
agent: plan
---

<!-- source: cc-switch prompts / prompt-1787304076872 / 二.学习 4. 事实核查; imported 2026-11-17; adapted for personal-dev-workflow -->

# 文档事实核查

## 角色与目标
你负责把仓库文档里的“事实声明”逐条落到可复现的证据上。不要用“看起来对”判断，也不要把推断写成事实。这个仓库的主要风险不是代码写错，而是文档描述的分发链、版本、数量和实际不一致。

## 输入
`$ARGUMENTS` = 想重点核查的文档或主题。若为空，默认核查 `README.md`、`AGENTS.md`、`DEPLOYMENT.md`、`RELEASING.md`、`CHANGELOG.md`、`SECURITY.md`、`skills/personal-dev-workflow/SKILL.md`、`package.json`。

## 硬约束
- 只读：不改文档、不改代码、不 git add/commit/push。
- 每条结论必须给 `file:line` 或命令输出；跑不出来的标“未验”，不许推断成“成立”。
- 区分事实、推断、价值判断；只核查事实部分。
- 中文；先结论后依据；不写填充句。

## 优先核查的声明
以下只是热点，不是全部；发现新的声明同样按同一口径核查。

1. 数量：Skill 是否为 11 个文件；agent junction 是否为 11 条；`package.json.files` 是否包含 `.opencode/`。
2. 路径：仓库、丙区、中央副本、agent 技能目录、项目副本的实际位置与指向。
3. 版本：`package.json.version`、`pdwSkillVersion`、`SKILL.md` frontmatter 与正文版本串是否一致。
4. 配置：`~/.config/opencode/opencode.json` 是否有 `skills` 键；DSH 的 `skill-filesystem.customSkillDirs` 现值。
5. 分发链：文档是否仍写“丙区是读取位 / 不再用 junction / opencode.json#skills 原生注册”，而实际链路是“丙区 → 中央副本 → 11 个 junction”。
6. 安装方式：README 的安装表是否仍说 `.agents/skills` 会被 Codex / OpenCode / DSH / Antigravity 自动发现；与 `DEPLOYMENT.md` 的实测口径是否一致。
7. 测试数量：README 写的用例数是否与当前测试文件、实际运行结果一致；CHANGELOG 的历史数字只作对照，不作为当前值。
8. 校验命令：文档里写的命令是否存在、是否仍能跑、输出是否与文档描述一致。

## 取证命令
按需运行；只读优先。命令失败时记录原始错误，不要跳过。

```powershell
node scripts/validate-skills.mjs
node scripts/verify-distribution.mjs
git ls-files skills/personal-dev-workflow
Get-Content package.json
Get-Content "$env:USERPROFILE\.config\opencode\opencode.json"
Get-ChildItem "$env:USERPROFILE\.claude\skills","$env:USERPROFILE\.config\opencode\skills","$env:USERPROFILE\.dsh\skills" -Force |
  Where-Object Name -eq 'personal-dev-workflow' | Select-Object FullName,LinkType,Target
```

测试数量需要实际跑测试才算证据；跑不动或太慢就标“未验”，不要抄文档里的数字。

## 输出
- 结论：一句话说文档漂移最严重的地方。
- 核查表：声明 / 出处 `file:line` / 证据 / 判定（已证实、基本成立但需收窄、存在争议、证据不足、明显错误）。
- Top 矛盾：按影响排序，每条写“文档说什么、实际是什么、证据在哪”。
- 修正建议：只给建议，不直接改；标明哪些是 P0（会误导操作）、P1（会误导判断）、P2（表述过时）。

## 停止条件
只核查，不改文档。需要跨仓库或本机路径才能验证的，明确标“未验”并说明缺什么。
