# Release process

How this repository distributes changes. **Policy replaced 2026-10-17**: no more versioned releases —
this repository ships the Skill on a **rolling `main`** branch.

## Current policy (2026-10-17)

- **不发版本**：no tag, no GitHub Release, no npm publish. "发布" = push to `main`.
- `package.json.version` stays at its last value (`2.0.1`) and **is not bumped**; it exists only as an identifier.
  The research/upstream version lives in `package.json.pdwSkillVersion` and must match the Skill body —
  `SKILL.md` 的正文版本串与 `scripts/pdw.mjs` 的 `const version`（`references/runtime.md` 不含版本串）。
- **CHANGELOG.md** keeps a rolling entry for `main` instead of per-version sections; new work appends to it.

## Why (2026-10-17)

- 使用位已改为**丙区读取位**（`~\.agents_four_skills\`，是 GitHub `main` 的本地镜像；oc/dsh 原生注册该目录、
  cc/agy 按需直读，**不再用 junction**，见 `DEPLOYMENT.md`），分发靠"push 到 `main` → 刷丙区 → 项目内按需复制"，
  不再依赖 tag 或包注册表；
- 上游（研究项目 `人机协作开发工作流研究`）按 `artifacts/releases/<version>/` 出包并直接同步过来，
  **以研究包为准做适配**，所以打 tag 只会制造第二套版本叙事；
- 用户明确要求"只提交合并，不发布版本"。

## Steps

```sh
# 1. 适配上游包（备份 → 覆盖 → 只补仓库布局必需的两处路径探测 → 行尾统一 LF）
#    see DEPLOYMENT.md 步骤 1
# 2. 抬 pdwSkillVersion（仅在导入新研究版时）并同步正文版本串（`SKILL.md`、`scripts/pdw.mjs`）
# 3. verify locally
node scripts/validate-skills.mjs
node --test scripts/validate-skills.test.mjs
node --test skills/personal-dev-workflow/scripts/drivers.test.mjs
node skills/personal-dev-workflow/scripts/pdw.test.mjs
node archive/tools/run-tests.mjs
# 4. commit and push（不 tag、不发 Release）
git add -A
git commit -m "feat(skill): import research <version> …"
git push origin main
# 5. 刷新丙区读取位（它是 GitHub main 的本地镜像，四个 agent 随之生效）
#    push 完成后 clone --depth 1 --branch main 取远端子路径 skills/personal-dev-workflow/，
#    与丙区那 8 个文件逐文件比 sha256：无差异什么都不改；有差异才先备份再整份覆盖。
#    命令与边界见 DEPLOYMENT.md §5（丙区不再直接由本仓库复制）
```

## Scope and current limitations

- **A "release" here means a push to `main`.** Install path for other machines stays
  `npx skills add satan9394/personal-dev-workflow`（**本机不用它**：本机的使用位是丙区读取位，见 `DEPLOYMENT.md`）。
- **No npm publishing**；旧 GitHub Packages 上的包（`@satan9394/dsh-personal-dev-workflow`）已于 2026-10-17 删除。
- Do the push from a machine whose git identity is `satan9394 <satan9394@users.noreply.github.com>`
  so no personal email lands in commit metadata.
- 历史 tag（`v0.3.1` … `v2.0.0`）保留为可回溯的旧叙事，不再新增。
