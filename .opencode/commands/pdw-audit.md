---
description: 一条命令跑完存量审计：文档漂移、认知成本、冗余、历史包袱、返工（只读）
agent: plan
---

<!-- source: composed from the eight imported cc-switch prompts; imported 2026-11-17; orchestrator only, does not duplicate the command bodies -->

# 存量审计总控

## 角色与目标
你负责按固定顺序执行 `.opencode/commands/` 下的 8 条只读分析命令，最后合并成一份按优先级排序的优化清单。总控只做编排，不复制各命令正文；每一步用 read 工具读取对应命令文件并按其步骤执行。

## 输入
`$ARGUMENTS` = 本轮审计重点（可空）。若为空，默认全仓审计，重点放在文档漂移、分发链、认知成本与返工。

## 硬约束
- 全程只读：不改文件、不装依赖、不 git add/commit/push。
- 每条结论给 `file:line` 或命令输出；跑不出的标“未验”。
- `archive/` 是刻意保留的历史，不列入清理。
- 中文；先结论后依据；不写填充句。
- 不在本命令里实施任何优化；优化另起任务。

## 执行顺序
1. 基线：`git status --short`、`node scripts/validate-skills.mjs`、`node scripts/verify-distribution.mjs`。记录退出码与末行。
2. 读并执行 `.opencode/commands/pdw-frame.md`：定义这轮真正要解决的问题，给三条路线。
3. 读并执行 `.opencode/commands/pdw-doc-truth.md`：文档事实核查。
4. 读并执行 `.opencode/commands/pdw-newcomer.md`：新人接手成本。
5. 读并执行 `.opencode/commands/pdw-slop.md`：live tree 冗余审计。
6. 读并执行 `.opencode/commands/pdw-archaeology.md`：Git 历史考古。
7. 读并执行 `.opencode/commands/pdw-retro.md`：返工复盘（默认 90 天）。
8. 从上面结果里挑前 3 个候选，分别读并执行 `.opencode/commands/pdw-impact.md`；其中证据最强的缺陷再读 `.opencode/commands/pdw-root.md`。
9. 合并去重，按 P0/P1/P2 排序。

## 输出
- 结论：一句话说这个仓库当前最值得优化的是什么。
- 基线证据：三条命令的退出码/末行。
- 分节结果：frame / doc-truth / newcomer / slop / archaeology / retro，各节只保留结论与关键证据，不复制全文。
- 优化清单：P0/P1/P2 表，每条含问题、证据、建议动作、风险、验证命令。
- 建议先做的 1–3 项：写清为什么是这三项、预期收益、回归面。
- 未验项：列出跑不动或需要用户提供的信息。

## 停止条件
只审计，不改动。需要用户拍板选哪几项时，停下来给出选项，不要自行实施。
