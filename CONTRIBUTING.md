# 贡献指南

感谢你愿意改进 **personal-dev-workflow**。这个仓库分发的是一个会被别的 Agent 直接执行的技能，所以「文档说的」和「代码做的」必须一致。

## 项目形态

一个把目标编译成任务契约、再由隔离角色会话执行的编码 Agent 技能（Skill），仓库同时分发无依赖的 Node CLI `scripts/pdw.mjs`。

技术栈：Node >= 18，零运行时依赖；`SKILL.md` 是技能正文，`scripts/` 是实现与测试。

## 开发环境

```bash
git clone https://github.com/satan9394/personal-dev-workflow.git
cd personal-dev-workflow
node --version   # 需要 >= 18
```

## 提交前检查

```bash
node scripts/validate-skills.mjs
node --test scripts/validate-skills.test.mjs
node --test skills/personal-dev-workflow/scripts/drivers.test.mjs
node skills/personal-dev-workflow/scripts/pdw.test.mjs
```

改 `SKILL.md` 必须同步 `pdwSkillVersion` 与相关断言；技能正文与运行时版本不一致会被 CI 拦下。

## 工作流

1. 非琐碎改动先开 Issue，说明问题、期望行为与复现方式。
2. 从 `main` 切分支（`fix/...`、`feat/...`、`docs/...`）。
3. 提交信息用 Conventional Commits（`fix(pdw): ...`、`docs(skill): ...`）。
4. PR 里写清动机、跑过的检查、以及是否改变技能触发条件或默认行为。
5. 一个 PR 只做一件事。

## 约定

- 技能正文（`SKILL.md`）与 CLI 实现必须同步：改了行为就改正文，改了正文就检查断言。
- 新增能力要有对应测试；修 bug 要带一个「回退修复就会变红」的回归用例。
- 不引入运行时依赖，保持零依赖安装。
- 不在仓库里放真实凭证、个人路径或本机日志样本。

## 安全

发现漏洞请不要开公开 Issue，按 [SECURITY.md](SECURITY.md) 的私密渠道报告。
