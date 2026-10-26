# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/); versions follow [SemVer](https://semver.org/).

## [main] — 2026-10-26 — Fourth re-cut of `1.3.3-local`: a read-only dashboard (`pdw view`)

### Skill content (same research version string, new bytes)

- **New `scripts/viewer.mjs` + `assets/viewer.html`.** `pdw view [--port <n>] [--open]` serves a
  read-only local dashboard for one project (default `http://127.0.0.1:8891/`). It reads
  `.pdw/tasks/` (`state.json`, `contract.json`, `attempts/*`, `checks-*`, `changed-files.json`) and the
  newest Codex session log for `rate_limits`; it never writes, never spawns a model and never calls the
  network. The module can also be imported (`startViewer({ project, port, open })`).
- **What the page shows:** the project's task list with filters and day grouping; a hero line that
  switches between "currently on step N · who is running it" and the final verdict; the seven steps with
  executor, model and reasoning depth (idle roles show their configured values, marked as not run); one
  normalised timeline strip with a plain-language caption; checks with exit codes; per-attempt records
  with log tails; changed files; and Codex remaining quota (5-hour and weekly windows) with absolute
  reset times.
- Theme: light / dark / follow system, written before first paint; the palette is the aurora-glass
  token set, with the background drifting on transform-only compositor layers.
- `pdw.mjs` gains the `view` command and lists it in `help`.
- Tests: one new case starts the server against a temporary project and asserts `/api/project`,
  `/api/tasks` and the HTML page. Suite 40/40, drivers 16/16, `verify-research.ps1` PASS.

### Distribution

- Skill count 9 → 11 files; `DEPLOYMENT.md` §3 and §4 refreshed; package re-cut a fourth time
  (`0e70e78e…`, previous `1479e0a1…` archived in `.pdw/upstream-package-prepack/`).
- Rolled out to `Vessel_Harness` first (2026-10-26); other projects remain on the previous cut until
  they run `update.mjs`.

## [main] — 2026-10-25 — Fleet routing moves to OpenCode + Codex (agy quota exhausted)

- `finquant-hub` and `model-infra-kit` `planner` moved from `agy` to `opencode`
  (`commandgota/deepseek/deepseek-v4.1-flash`, `high`); both also gained explicit
  `reasoning_effort: high` on `scan` / `test-plan`.
- `finquant-hub` `implement` was pointing at a deleted Store build path
  (`…\OpenAI\Codex\bin\896a0166b774037a\codex.exe`), so `doctor` exited 1; repointed to the npm vendor
  binary with explicit `gpt-6.1-sol` + `medium`.
- Config backups: `<项目>/.pdw/config.bak-20261025-oc-codex.json`. All four projects `doctor` exit 0.
  `DEPLOYMENT.md` §7.1 matrix updated. Limits on those two projects remain the older
  `8 / 600s / 3600s`; raising them is a budget decision and was not made.
- **`workbuddy` retired from PDW (user: the line is unstable).** `remote-job-aggregator` was the last
  project on it; all five roles now use `opencode` + `commandgota/deepseek/deepseek-v4.1-flash`
  (`#high` / `#max`) with `implement` on Codex `gpt-6.1-sol` + `medium`. The per-role
  `prompt_guidance` that existed only to force strict JSON out of workbuddy was dropped. Backup:
  `.pdw/config.bak-20261025-drop-workbuddy.json`. The `workbuddy` provider entry itself is left in
  `opencode.json` (CC Switch manages that file); PDW simply no longer routes to it.
- **`agy` archived, not removed** (quota exhausted). The CLI stays installed; `DEPLOYMENT.md` §7.1
  carries a ready-to-paste `planner` snippet so restoring it later is one role edit plus `doctor`.
- **Provider renamed `commandgota` → `commandcode`.** The old key is gone from
  `~/.config/opencode/opencode.json`; three of the four projects still had the old name and would have
  failed on their next run. `doctor` cannot see this (it only validates the executable and that a model
  is explicit), so it was caught by reconciling against `opencode models` from the new viewer. All four
  configs updated; `doctor` exit 0.

## [main] — 2026-10-24 — Third re-cut of `1.3.3-local`: host model discovery, `--mirror`, effort vocabulary

### Skill content (same research version string, new bytes)

- **`init` reads OpenCode v2 `providers` again.** `detectCheapModel()` only read the v1 `provider`
  key, so on OpenCode 2.x it returned `null`; a fresh `init` then wrote `model: null` and `run`
  refused with "Set an explicit cheap model". It now reads `providers`, falls back to `provider`,
  refuses non-object values, and has a fixture covering both shapes. On this machine it resolves a
  model again instead of `null`.
- **`update.mjs --mirror <dir>`** brings a second copy (for example a shared agent skill root) to
  the published bytes in the same run. The mirror must already exist and must not contain, or be
  contained by, the installed skill. A stale mirror is repaired even when the installed copy is
  already current; mirror-only files are reported and kept; the mirror is backed up to
  `.pdw/skill-upgrade-<date>/personal-dev-workflow-pre-<version>-mirror/` before any overwrite.
  This replaces the "update, then remember to copy nine files by hand" step that could fail
  silently.
- **Effort vocabulary corrected in `references/runtime.md`.** The reference claimed that
  "low/medium/high map to the same reasoningEffort values" for DeepSeek V4.1 Flash. Its declared
  variants are `low/high/max/off`; `medium` does not exist and `off` disables thinking.
  GPT-6.1 Sol declares `low/medium/high/xhigh/max/ultra`. Machine-specific claims (a named provider,
  OpenCode 2.0.30 / 2.0.32) were replaced with version-neutral wording, and `--mirror` is documented.
- `SKILL.md` metadata `updated` for this cut; the distribution section mentions `--mirror`.

### Verification

- Research: `pdw.test.mjs` 39/39, `drivers.test.mjs` 16/16, `scripts/verify-research.ps1` PASS,
  `pack-release.py` `zip_crc` PASS.
- Distribution: `validate-skills.mjs` ok, `validate-skills.test.mjs` 0 failed, `drivers.test.mjs`
  0 failed, `pdw.test.mjs` 39/39, `archive/tools/run-tests.mjs` 42 passed / 1 skipped.
- Package: `1.3.3-local` re-cut a third time, sha256 `1479e0a1…` (the previous `e61a3307…` is
  archived in `.pdw/upstream-package-prepack/`). Only the two repository-layout probes differ from
  the package.

## [main] — 2026-10-19 — Repair the CP936 mojibake in every historical GitHub Release

### Distribution
- **A batch publish on 2026-10-18 05:34 UTC pushed all nine release titles and bodies through the
  Windows CP936 console path.** `—` became `閳?` (78 sites), `→` / `≤` / `…` / `§` / `·` became CP936
  look-alikes, and one stray BOM was left inside each body. Nothing else was hit: commit messages,
  tag objects, every tracked file and the other three repositories that have releases were checked
  byte by byte and are clean.
- **All nine releases (v0.3.1 … v2.0.0) were re-published with repaired titles and bodies** through
  `gh api -X PATCH --input` (a UTF-8 file, never a PowerShell string). Each replacement is proved by
  re-simulating the two-layer corruption with .NET CP936: `corrupt(fixed, 2)` now equals the live text
  character for character, for every title and body. Repair tool, before/after snapshots and the
  verification scripts: `.pdw/release-notes-repair-20261018/`.
- Six titles were restored to the wording of their tag message or CHANGELOG heading; v1.0.0, v0.5.2
  and v0.5.1 already used an ASCII hyphen and were left untouched. No tag moved, no release was
  created or deleted, and distribution still rolls on `main`.

### Rules and documentation
- **`RELEASING.md` gains an encoding rule**: release text travels as a BOM-less UTF-8 file through
  `gh api --input`; never through a PowerShell string, here-string or `--notes` argument.

## [main] — 2026-10-18 — Second re-cut of `1.3.3-local`: the updater states the config-confirmation rule

### Skill content (same research version string, new bytes)
- **`scripts/update.mjs` now says it out loud**: on both the `already current` and the `updated` path it prints that
  model, reasoning depth, limits and `prompt_guidance` are project settings that need a diff and explicit user
  confirmation, and it always carries the same sentence as `summary.note`. `SKILL.md` and `references/runtime.md`
  state the rule too, and the updater fixture asserts the wording.
- **Why**: on 2026-10-18 two agy sessions learned "skill is current" from `update.mjs` and then rewrote project model
  settings unprompted. The rule itself is already recorded in `DEPLOYMENT.md` §7 and in every project's
  `<!-- pdw-skill-sync -->` block; this round makes the runtime say it as well.
- Only local adaptation stays the two layout probes; test counts unchanged (`pdw.test.mjs` 38, `drivers.test.mjs` 16,
  validator 7, archive 43).
- Superseded bytes are kept in `.pdw/upstream-package-prepack/`: `25da41f8…` (original) and `38167ace…` (first
  re-cut); the current archive is `e61a3307…`.

### Distribution
- Mirror and the four project copies are refreshed to the second re-cut by per-file sha256; no project
  `.pdw/config.json` is touched; `doctor` exits 0. Still no tag, no Release, no npm publish.

## [main] — 2026-10-18 — Config-change confirmation gate, effort and model matrix refresh

### Rules and documentation
- **A project-level config change now needs explicit user confirmation**: model, reasoning depth (`reasoning_effort` /
  `model#variant`), limits and `prompt_guidance` are project settings. Give a diff, wait for confirmation, then write;
  back up to `.pdw/skill-upgrade-<YYYYMMDD>/config.json.bak-<purpose>-<YYYYMMDD>` first. The rule now ships inside every
  project's `<!-- pdw-skill-sync -->` block, so a project agent sees it without reading this repository.
- **`DEPLOYMENT.md` §7.1 refreshed**: `finquant-hub`, `Vessel_Harness` and `model-infra-kit` run `scan` / `test-plan` /
  `review` on `commandgota/deepseek/deepseek-v4.1-flash` with `review` pinned to `max`; `remote-job-aggregator` is the
  only one left on `workbuddy/deepseek-v4.1-flash` (`review` = `high`), and the workbuddy line is recorded as retiring.
  Backup naming unified; the two earlier files keep their old names.
- **No Skill file changed in this round**; distribution still rolls on `main`, with no tag, Release or npm publish.

## [main] — 2026-10-17 — Re-cut the `1.3.3-local` package: snapshot guard rails, a bundled updater, origin metadata

### Skill content (same research version string, new bytes)
- **The upstream package `1.3.3-local` was re-cut in place** on the user's decision and the Skill was re-imported from
  it. The version string did **not** change, so compare copies by **per-file sha256**, never by the version string.
  The superseded archive (`sha256 25da41f8…`) is kept in `.pdw/upstream-package-prepack/`.
- **`snapshot()` guard rails (implemented upstream, with fixtures)**: when Git is the source of the file list the work
  tree must equal the project root, and a covered set with no readable file refuses to record an empty baseline. This
  closes the defect shape in which an empty `contents` baseline makes every later drift comparison pass (research
  decision D-0084; the failure direction is now safe, before any model call).
- **`scripts/update.mjs` — the 9th file**: one-command self-update from the published repository. It clones
  `--depth 1 --branch main` with `core.autocrlf=false` (the operator's line-ending settings cannot distort the byte
  comparison), compares the whole skill tree, backs the installed copy up into
  `<project>/.pdw/skill-upgrade-<YYYYMMDD>/`, replaces changed/added files atomically (it can replace itself), then
  runs `doctor`. Idempotent, never touches `.pdw/config.json`, deletes nothing, never commits or pushes.
- **The Skill carries its own origin**: `SKILL.md` frontmatter `metadata` (`version` / `repository` / `skill-path` /
  `branch` / `updated`) plus a distribution section in `SKILL.md` and `references/runtime.md`. These no longer live
  only in this repository's documents, so the upstream package and this repository stop drifting apart.
- **Line endings**: all 9 files are LF (the package previously mixed CRLF and LF in `SKILL.md`, `scripts/pdw.mjs`,
  `agents/openai.yaml`, `assets/audit-task.json` and `references/runtime.md`). The only remaining local adaptation is
  the two repository-layout probes.
- Test counts: `pdw.test.mjs` 34 → **38** cases (two snapshot guard fixtures, two updater fixtures),
  `drivers.test.mjs` 16, `validate-skills.test.mjs` 7, `archive/tools/run-tests.mjs` 43 (42 pass + 1 conditional skip).
- The pre-re-cut 8 files are kept in `.pdw/skill-adaptation-20261017-recut/pre-package-baseline/`.

### Distribution
- Mirror and project copies (`finquant-hub`, `Vessel_Harness`, `model-infra-kit`, `remote-job-aggregator`) were
  refreshed to the re-cut 9 files by per-file sha256; old copies are in each project's
  `.pdw/skill-upgrade-20261017-recut/`; each project's own `.pdw/config.json` is untouched and `doctor` exits 0.
- The `<!-- pdw-skill-sync -->` blocks in those projects now describe 9 files and the `update.mjs` path.
- Still **no tag, no Release, no npm publish**: distribution rolls on `main`.

## [main] — 2026-10-17 — Import research 1.3.3-local, distribute from the shared personal-skills area, roll on `main`

### Skill content
- **The canonical Skill now is the upstream research package** `1.3.3-local` (built in
  `人机协作开发工作流研究/artifacts/releases/1.3.3-local`): `SKILL.md`, `references/runtime.md`,
  `scripts/pdw.mjs`, `scripts/drivers.mjs`, `scripts/drivers.test.mjs`, `scripts/pdw.test.mjs` match the package
  byte-for-byte; `agents/openai.yaml` and `assets/audit-task.json` were already identical.
  `pdwSkillVersion`: `1.3.2-local` → `1.3.3-local` (the body version strings follow).
- **New upstream behaviour**: OpenCode TUI effort/variant handling — `/effort`, `/thinking`, `/variants`, model
  variants, and `reasoning_effort` in role config (or the `model#variant` shorthand) — plus the state-write lock retry.
- **Known reduction (intentional, package-as-baseline)**: 1.3.3 is a subtractive refactor. `drivers.mjs` drops
  `balancedSpans` and adds `modelSettings`; `drivers.test.mjs` goes from 28 to 14 cases and no longer contains the
  role-JSON recovery / malformed-JSON / final-file-precedence cases. Consequently the two local repairs this repo
  used to carry — role-JSON recovery from prose, fences and balanced braces (`jsonValues`), and the final-response
  wording paragraph in `references/runtime.md` — are gone with them. If that robustness is wanted back, it belongs
  in the research project and should arrive as a new package, not as a local patch.
- **Only repository-layout adaptations are kept**: one path probe each in `scripts/pdw.test.mjs` and
  `scripts/drivers.test.mjs` (3 levels in-repo vs 4 levels installed — without it the test suites write evidence
  into the repository's parent directory), and LF line endings (the packaged `scripts/pdw.mjs` ships CRLF).
- The previous 8 files are kept in `.pdw/skill-adaptation-20261017/pre-package-baseline/` for traceability.

### Distribution
- **Repository and package renamed**: `satan9394/dsh-personal-dev-workflow` → `satan9394/personal-dev-workflow`
  (`gh repo rename`; the old URL redirects), package name → `@satan9394/personal-dev-workflow`, and the old
  GitHub Packages artifact (`@satan9394/dsh-personal-dev-workflow`) was deleted.
- **Single install location**: the Skill now ships from the author's shared personal-skills area
  (`~/.agents_four_skills/personal-dev-workflow`). It was removed from the skills-manager library, so
  `skills update` / `skills deploy` / `skills set-source` no longer apply to it.
- **No junctions**: OpenCode registers that directory natively (`opencode.json#skills`), DeepSeek Harness via
  `skill-filesystem.customSkillDirs`; Claude Code and Antigravity have no such setting and read `<name>/SKILL.md`
  on demand. **Codex does not read skills** and is out of scope. The 16 per-agent links were removed.
- **Project-level copies** are plain copies with a fixed layout: `<project>/.agents/skills/personal-dev-workflow/`
  (8 files, LF) + the project's own `.pdw/config.json` untouched + a `<!-- pdw-skill-sync -->` block in the
  project's `AGENTS.md` that tells a project agent how to re-sync from the canonical source when asked ("更").
  Configured and verified on 2026-10-17: `finquant-hub`, `Vessel_Harness`, `model-infra-kit`,
  `remote-job-aggregator` — 8/8 files identical to the source and `doctor` exit 0 in all four.

### Release policy
- **Rolling `main`, no versioned releases**: no tags, no GitHub Releases, no npm publishing. `package.json.version`
  stays at `2.0.1` and is no longer bumped; "releasing" now means pushing `main`. See `RELEASING.md`.

### Verification
- `node scripts/validate-skills.mjs` (declares `1.3.3-local`, matching `pdwSkillVersion`; distribution `2.0.1`),
  `validate-skills.test`, `drivers.test`, `pdw.test` (34 pass) and `archive/tools/run-tests.mjs`
  (42 pass + 1 conditional skip) are green; the `validate-skills` CI job is green on every push.

### Fixed
- Test runs no longer create `.pdw` in the parent of the repository (the stray directory was recycled).

## Unreleased

- Support OpenCode reasoning effort through explicit model variants, matching TUI `/effort` on 2.0.32.
- Preserve the selected model's saved TUI variant when initializing a new project; existing configurations remain unchanged.
- Record the effective model and variant in doctor, prompts and attempt evidence; reject conflicting settings.
- Retry transient Windows reader locks during atomic state replacement for at most one second; retain the original and fail on persistent errors.

## [2.0.1] — 2026-10-16 — Research 1.3.2 guard repairs and Skill normalization

### Fixed
- Import research Skill 1.3.2-local: ignored-root/empty-Git and explicit ignored-scope coverage,
  canonical paths, failed-snapshot reporting, truthful doctor flags, Windows npm Codex native
  discovery, reserved CLI prefix rejection and consistent runtime versions.
- Retain the committed role-JSON recovery fix (`0e06aea`) and add malformed/embedded-output regressions.
- Prevent nested tool data and earlier draft verdicts from overriding the final response; treat a
  dedicated final file as authoritative and reject it when malformed.
- Require complete final text events; unknown delta streams need an explicit protocol adapter.
- Keep test evidence inside this repository in its canonical layout and in installed layouts.
- Strip Markdown fragments when validating local reference targets.

### Changed
- Follow current skill-creator: frontmatter only name/description; display metadata in agents/;
  runtime/reference/assets separation; no repository release notes or temporary backups in Skill.
- Keep distribution 2.0.1 separate from research/runtime 1.3.2-local using `pdwSkillVersion`.
- **Ship the Skill only**: the DSH plugin bundle (`plugin/`), the SkillHub package (`dist/skillhub-pkg`) and `scripts/sync-copies.mjs` were removed on the user's instruction — a plugin is not a Skill. The validator, its tests, the CI wording and `package.json` `files`/`scripts` no longer mention a plugin, a dist package or a copy step, so canonical-vs-copy drift can no longer exist.
- Preserve the pre-existing untracked backup under ignored `.pdw/migrations/research-1.3.2/`.

### Boundaries / upgrade
- This is a local preparation, not a published release. Preserve existing task state/evidence/budgets;
  same-name installation still refuses overwrite and migration remains manual.
- Doctor does not prove authentication/provider routing; no money/token ceiling or DSH/CC automatic backend.

## [2.0.0] — 2026-10-16 — Executable relay: one coordinator, CLI-dispatched role sessions

v2.0.0 replaces the skill body with the line developed in the author's PDW research project (shipped there as
`1.3.1-local`). The workflow stops being a document the agent is asked to follow and becomes a program the agent
drives: `scripts/pdw.mjs` freezes a contract, dispatches `scan → test-plan → implement → review` (plus an
optional `planner`) to CLI agents, runs the acceptance commands itself, keeps every raw log, and allows at most
one targeted repair. This is a breaking release for anyone installing the skill by name.

### Changed
- **The skill is now executable.** `skills/personal-dev-workflow/SKILL.md` is a 73-line zh-CN body (English
  `description` so English-language agents still trigger it) that drives `scripts/pdw.mjs` — `init` / `doctor` /
  `new` / `plan` / `run` / `status` / `handoff` / `cancel` / `resume` / `demo` / `install`, all with `--project`.
- **One skill, not two.** `personal-dev-workflow-zh` is retired; the surviving skill is named
  `personal-dev-workflow` and its body is Chinese. `dist/skillhub-pkg-en` + `dist/skillhub-pkg-zh` collapse into
  a single `dist/skillhub-pkg`, and the plugin bundle carries one skill.
- **State model replaced.** Run state is `.pdw/tasks/<id>/state.json` beside `contract.json` (frozen contract)
  and `baseline.json` (starting hashes); `HANDOFF.md` and `REPORT.md` are re-derivable views. `status` and
  `handoff` re-hash the sources, so an acceptance recorded before a source change comes back as
  `accepted_current=false` instead of being reused.
- **Limits are the ones the program can actually enforce** — CLI launches, elapsed time, single-process timeout
  and repair count. Money/token ceilings are recorded as `unknown`: with no provider usage evidence the skill no
  longer claims a currency cap, and it says so instead of implying one.
- **Cost routing is explicit in config.** The `.pdw/config.json` roles (`scan / test-plan / implement / review /
  planner`) each carry backend / executable / model; `init` only selects the low-cost model it can actually
  identify and never silently falls back to an expensive default.
- **The release number moves in all three manifests** — root `package.json`, the plugin manifest and every
  canonical `metadata.version` now declare `2.0.0`.
- **CI** — the retired en/zh validator pair becomes a single `skills-ref validate skills/personal-dev-workflow`
  step, and the relay's own suite (`node skills/personal-dev-workflow/scripts/pdw.test.mjs`, 20 cases) joins the job.

### Removed from the skill (the v1.0.0 content stays reachable at tag `v1.0.0`)
- 11 `references/` documents (core loop, verification, memory policy, bounded autonomy, state schema, model
  profiles, adapters, migration), 4 `evals/` suites, 3 `assets/` templates, `scripts/runstate.js` +
  `scripts/runstate.test.js` + `scripts/validate-skill.py` + `scripts/package.json`, and the per-skill
  `MANIFEST.sha256` / `CHANGELOG.md` / `README.md` / `LICENSE` copies — 27 files replaced by 7.
- The claimed host-enforcement story (`gate` / `advance` / `worker-start` subcommands, Run/Mission budgets) leaves
  the skill: v2.0.0 states the boundary instead of shipping an adapter that was never verified as ready-to-use.

### Kept (not loaded by this skill)
- `tools/runstate.js` + `tools/run-tests.mjs` — the v0.5.x Markdown `RUN_STATE.md` controller and its 43-case
  suite; the author's deployed DSH profile still points at this controller (its host gate is currently disabled).
- `plugin/dsh-budget-gate/` (v0.5.x host gate, byte-identical to the deployed copy), `docs/`, `demos/` and
  `taskcard-cli.js` — historical evidence and standalone tools, unchanged.

## [1.0.0] — 2026-09-24 — Structural rework: four modes, JSON state, layered enforcement

v1.0.0 restores the Skill as an **on-demand workflow capability** rather than a large always-loaded rule
document. The six-step loop keeps one card reliable; this release separates *runtime control*, *state* and
*platform adaptation* into layers so none of them is mistaken for a host hard gate.

### Changed
- **Four explicit modes replace the implicit default.** `quick` / `standard` / `bounded` / `audit`.
  `standard` (the default) completes one card, shows evidence and **stops** — it no longer auto-continues to
  the next card. Continuous autonomy now requires an explicit `bounded` opt-in; installing the Skill, having
  task cards, or having an `AGENTS.md` does **not** constitute authorization.
- **Machine state moved out of Markdown.** `.agent-state/run-state.json` is the source of truth;
  `RUN_STATE.md` is only a rendered view. The v0.5.x controller read and wrote the Markdown file directly.
- **Worker accounting split into a gauge and a counter.** `workers.active` can go up and down
  (`worker-start` / `worker-stop`); `workersSpawned` only increases. This removes the v0.5.x behaviour where a
  finished worker kept occupying a concurrency slot.
- **Budgets are action-scoped.** Reaching the repair cap only rejects new repairs; reaching the research cap
  only rejects new research; a spent worker cap only rejects dispatching more workers. The main agent can
  still finish the card it is on.
- **The body shrank to routing and the core contract** (86 lines); per-aspect detail now lives in
  `references/` and loads on demand.
- **Chinese variant must have its own skill name.** `personal-dev-workflow-zh` — the standard requires
  `name` to match the folder, and two skills cannot share one name.

### Added
- **Task-typed verification evidence** — docs / backend / frontend / infra / security each use their most
  relevant evidence instead of mechanically demanding tests + build + screenshots (`references/verification.md`).
- **Memory taxonomy** — AGENTS / ADR-docs / Task Card / machine state / changelog each own one fact; small
  cards are no longer forced to write daily log + CHANGELOG + state + AGENTS all at once (`references/memory-policy.md`).
- **Model capability profiles** — the core binds to no model name; planner / executor / evaluator /
  researcher capability contracts live in the core, specific models go into optional presets
  (`references/model-profiles.md`, `references/preset-agy-codex.md`).
- **Adapter docs** — DSH, Codex and Claude Code, each stating what the host can and cannot enforce
  (`references/adapter-*.md`).
- **Behavioural eval cases** — trigger / workflow / autonomy / recovery (`evals/`), so behaviour is verified
  rather than only format.
- **Per-skill validators and a manifest** — `scripts/validate-skill.py` checks structure, frontmatter and
  local references; `MANIFEST.sha256` pins the shipped files.
- **`scripts/package.json`** declaring `commonjs`, so the shipped controller runs even when the host project
  has `"type": "module"` (Node would otherwise parse the CommonJS `runstate.js` as ESM and fail).

### Fixed
- **The generic Skill no longer claims host enforcement.** v0.5.x prose described budgets as "enforced" while
  the controller could only refuse *the write it was asked to perform*. v1.0.0 states the boundary explicitly:
  the controller is checkable, not enforceable; a true pre-execute hard gate is adapter-specific.
- **No unverified DSH plugin is shipped as ready-to-use.** Hook APIs vary between DSH versions, so v1.0.0
  provides the stable controller contract plus an adapter description, not plugin code presented as a
  ready-made hard gate.

### Kept for reference (v0.5.x, not part of the v1.0.0 state model)
- `tools/runstate.js` and its 34-case `tools/run-tests.mjs` — the Markdown `RUN_STATE.md` controller.
- `plugin/dsh-budget-gate/` — the DSH host gate for the Markdown model, byte-identical to the deployed copy.
- `docs/case-study-bounded-autonomy.md`, `docs/evidence/runstate-cli/` — the three-run bounded-autonomy
  evidence, gathered under the Markdown model.
- `taskcard-cli.js` — task-card CLI, still applicable.
  These are retained so the historical evidence keeps resolving; see the README's "Legacy v0.5.x artifacts".

## [0.5.3] — 2026-09-13 — Agent Skills standard compliance: frontmatter fields put back where the standard says they belong

v0.5.2 was published while the skills were only *DSH-valid*, not *standard-valid*. An audit of the Agent Skills
specification (reproducible commands in `docs/audit-agent-skills-standard.md`) ran the official reference validator
against both `SKILL.md` files, and both were **rejected**: this release is a cross-client format-contract fix, not a
content change. The methodology body, the `description` text and the validator's judgement on the five pre-existing
rules are all untouched — the release number moves because what the frontmatter promises to *other* clients changed.

### Fixed
- **Audit finding F-2 — the three non-standard top-level fields are gone.** `slug`, `displayName` and `version` sat at
  the top level of the frontmatter; the standard's frontmatter whitelist allows only **6** keys
  (`name` / `description` / `license` / `compatibility` / `metadata` / `allowed-tools`), and the official validator
  rejected the whole file: *"Unexpected fields in frontmatter: displayName, slug, version"*. `slug` (a duplicate of
  `name`) was dropped and `displayName` / `version` moved **into** `metadata` — which is where the specification's own
  examples put `version`.
- **Audit finding F-1 — `metadata.tags` is a string scalar, not a flow array.** It was written
  `tags: [development, workflow, task-card, dsh, bounded-autonomy]`; the official YAML parser fails on that line
  (*"Invalid YAML in frontmatter … flow mapping"*) and the standard types `metadata` as **string → string**, so an
  array was doubly wrong. It is now the single string
  `"development, workflow, task-card, dsh, bounded-autonomy"`.
- **Audit finding F-3 — a body reference that pointed at nothing.** The English `SKILL.md` told readers the Chinese
  version lived at `SKILL.zh-CN.md` with templates under `references.zh-CN/`; **neither path exists** in the published
  tree (the Chinese version is its own skill directory, `personal-dev-workflow-zh/`). The line now names that
  directory. The official validator does **not** check body references, and the repo validator's old pattern only
  matched bare `references/<file>` — it had no shape for the `references.<x>/` directory form — which is exactly why
  three separate checks had missed it.

### Added
- **The two optional standard fields the skills genuinely had values for.** `license: MIT` (the repository root
  already ships `LICENSE`) and a `compatibility` line stating the real environment requirement — a client-neutral
  Agent Skill, with Node.js 18+ only for the optional `tools/runstate.js` budget controller and the DSH-only
  `pre-execute` host gate. Both were audit finding F-5 ("unused optional fields").
- **Six specification checks in `scripts/validate-skills.mjs`, each proved able to fail.** The repo validator now
  covers the same field set and value rules as the official validator, as a **supplement, not an equivalent**: the
  frontmatter key whitelist, no YAML flow collections anywhere in the frontmatter, the `name` charset/length/hyphen
  rules, `description` ≤ 1024 characters, body references extended to markdown links and `references.<x>/` targets,
  and string-scalar-only `metadata` values. The two gates are **not** interchangeable, and the measured differences
  are: a `compatibility` value over 500 characters and a quoted `description: ""` pass this script but are rejected
  by the official validator (false negatives), while an unquoted `description` such as `Use [this] notation` is
  rejected here but accepted there (false positive). The official validator wired into CI (see Notes) is the
  backstop for exactly those differences, which is why it runs **in addition to** this script rather than replacing
  it. Each specification check carries a stable `[spec:<id>]` tag so the failure path is provable, and **8 negative
  fixtures** (6 checks; the reference-target check has 3 shapes — bare path, markdown link, dotted directory) each
  exit 1 naming the intended check. The five pre-existing rules were re-run before/after and still fire on their
  original cases; the specification checks above are additions layered on them, and the one existing rule whose input
  moved is rule 5, which now reads `metadata.version` (the F-2 move) instead of the top-level `version`.

### Changed
- Release number aligned to `0.5.3` in the root `package.json`, `plugin/dsh-personal-dev-workflow/package.json`, both
  canonical `SKILL.md` **`metadata.version`** fields and the README badge, with the packaged copies regenerated from
  `skills/` so the byte-for-byte copy check stays clean.
- The README's Verification section said the validator requires every canonical `SKILL.md` "**`version`** equals the
  root `package.json` version". That sentence described the pre-F-2 reading and was stale the moment `version` moved
  into `metadata`; it now says **`metadata.version`**.
- `docs/audit-agent-skills-standard.md` is the audit this release answers, and is part of the 0.5.3 changeset.

### Notes
- **CI integration of the official validator (audit recommendation 6) — delivered in this release.** An earlier
  revision of this Note deferred the work to a follow-up card; it is now a delivered, reproduced gate.
  `validate-skills.yml` now runs the official reference validator *after* the two
  pre-existing Node steps, without altering them: `actions/setup-python@v5` (**Python 3.12**) → `pip install` of the
  reference library pinned to the immutable commit **`69ef37e9424c0a7ea9dd2293b559e43ec8176379`** (`skills-ref`
  0.1.0) → `skills-ref validate skills/personal-dev-workflow` and `skills-ref validate
  skills/personal-dev-workflow-zh`. The SHA was resolved with `git ls-remote https://github.com/agentskills/agentskills
  HEAD` and is pinned rather than tracking `main`, so the gate cannot drift under the repository. Neither validation
  carries `|| true`: a rejection fails the job.
- **The F-6 locale defect is neutralised at job level, and the fix was reproduced rather than assumed.**
  `PYTHONUTF8: '1'` is set on the job (not on a single step), because the reference validator reads `SKILL.md` with
  `read_text()` and therefore decodes with the platform default encoding. Reproduced on a zh-CN Windows host: with the
  variable unset the validator exits **1** with `UnicodeDecodeError: 'gbk' codec can't decode byte 0x93 in position
  2417`; with it set, both skills report `Valid skill` and exit **0**. Linux runners are unaffected by F-6.
- **Runner matrix — actual scope, stated plainly.** `validate-skills.yml` is a **single-OS** job
  (`runs-on: ubuntu-latest`), not a 3-OS matrix, so the official-validator gate runs once per event; a "run the full
  matrix" step would be a change to the existing job's semantics rather than an addition, and was not made. The
  `PYTHONUTF8` guard sits at job level precisely so that adding `windows-latest` later cannot silently reintroduce
  F-6.
- **Local end-to-end run of the new CI steps (evidence for the entry above, not an inference from them).** In an
  independent venv — `~/skill-audit/ci-repro/venv`, never the repository or the system Python — `pip install` of the same `git+https://github.com/agentskills/agentskills@69ef37e9…#subdirectory=skills-ref`
  argument built the identical wheel (`skills_ref-0.1.0-py3-none-any.whl`,
  `sha256:ebe501f61a4a7726a7f47444e6b48b630d0b40909c634ea27dd33240197d732f`) and both commands exited **0** under
  Python 3.12 and 3.11. The only differences from the CI step are the OS and the local proxy needed to reach GitHub.
- Historical version references stay as they are: the `0.5.2` changelog entry below, `## Bounded autonomy (v0.5.2)`
  in the README, and the `## Why bounded autonomy (v0.5.2)` headings in `references/framework.md` all record *when*
  something shipped, so bumping them would falsify the record rather than align it.
- The audit's official-validator transcripts in `docs/audit-agent-skills-standard.md` are quoted verbatim and were
  deliberately **not** edited, even where they show the pre-fix frontmatter.

## [0.5.2] — 2026-09-13 — Mechanical witnesses for the Run-level caps the documents already promised (P1-7)

v0.5.1 was published while the adversarial review's **P1-7** was still open: the finding was never turned into a task
card, so it was silently left out of that release's scope. The conductor's own post-release self-check caught the
omission, and this release closes the finding rather than re-describing it. It was cheap to reproduce and entirely
real — `init` wrote **4** counter lines in `## Budget`, `advance workset` / `advance workers` exited **2** ("unknown
field"), and `advance subagents` had **no cap at all** (20 pushes reached `已派子代理: 21`). Meanwhile the documents
promised `WorkSet 规模 ≤ 8`, `Worker 数 ≤ 3` and `已派子代理 ≤ 8`: three commitments with no mechanical witness.

### Fixed
- **P1-7 — the promised Run-level caps now have witnesses in the file.** `init` scaffolds **8** Run-level counter
  lines instead of 4: `Epoch` / `完成卡数` / `已用 Repair` / `已派子代理` (promoted from an uncapped note to
  `0 / 8`) / `WorkSet 规模: 0 / 8` / `Worker 数: 0 / 3` / `Research pass: 0 / 1` / `子代理嵌套: 0 / 1`.
  `framework.md` also promises `Research pass ≤ 1` and `子代理嵌套 ≤ 1` — the same "commitment without a witness"
  shape — so the ruling on the card was to close the whole class at once, which is why the final count is 8.
- The five new caps are folded into **F1's whole-file validation and refuse-as-a-unit semantics**: once any limited
  counter is at its cap, **any** `advance` exits 1 with the state file left **byte-identical**, and `gate` reports
  `{"allow":false,…}` on the same condition.
- **Backward compatibility (required).** A legacy `RUN_STATE.md` that is missing the four new lines, or that writes
  `已派子代理` / `Worker 数` in the old cap-less note form (e.g. `- Worker 数: 2（上限 3）`, where 上限 3 is only a
  remark), still passes `check` with **exit 0** plus a warning listing what is missing; `advance` / `new-run` / `gate`
  behave unchanged. Only a label that is *present* with an invalid or duplicated value is a state error.

### Added
- Four `advance` field aliases: `workset` → `WorkSet 规模`, `workers` → `Worker 数`, `research` → `Research pass`,
  `depth` → `子代理嵌套` (case-insensitive; `epoch` / `cards` / `repairs` / `subagents` unchanged). `new-run` now
  resets **all 8** Run-level counters, skipping legacy lines that are absent instead of failing on them.
- `tools/run-tests.mjs`: **9 new cases, 34 → 43** — the 8-line skeleton and its 5 caps, the four aliases, cap-refusal
  with an unchanged SHA256 on each new counter, `gate` DENY at the `WorkSet 规模` cap, `new-run` on both a current and
  a legacy file, and a cross-document assertion that the EN/ZH `SKILL.md` / `production-control.md` / `framework.md` /
  `run-state-template.md` spell the 8 labels and 4 aliases exactly as the CLI does.

### Changed
- Both `references/production-control.md`, both `SKILL.md`, both `references/framework.md` and both
  `references/run-state-template.md` (EN/ZH) now carry the same 8 counter labels and 4 aliases as the CLI; the sample
  `RUN_STATE.md` a reader copies was the most visible drift, since it had shown only 6 counter lines.
- Release number aligned to `0.5.2` in the root `package.json`, `plugin/dsh-personal-dev-workflow/package.json`, both
  canonical `SKILL.md` frontmatter blocks, the README badge, both `references/framework.md` headings and the README's
  "Bounded autonomy" heading, with the packaged copies regenerated from `skills/` so the validator is byte-clean.

### Notes
- **Card-face erratum (7 → 8).** The F2 card first said the `## Budget` section grows to "7" counter lines while
  enumerating only 6 — a typo on the card, not a design decision. The ruling recorded on that card was to close the
  whole class of witness-less promises, so the delivered total is **8**; the card was annotated rather than the
  number being silently reinterpreted.
- **Honest process note.** P1-7 should have been carded when the review landed; it was not, and v0.5.1 shipped
  without it. This release exists because the conductor's own post-release self-check found that gap — it is recorded
  here rather than quietly backfilled into the 0.5.1 entry.
- Historical version references are intentionally left alone: "v0.5.1 and earlier" in `production-control.md`, "Since
  v0.5.1" in `SKILL.md`, and the README's "measured" enforcement-boundary heading all describe *when* something was
  introduced or measured, so bumping them would falsify the record.

## [0.5.1] — 2026-09-13 — Honesty and coverage: whole-file validation in the controller, and the host gate written down

v0.5.1 has two themes, and neither is cosmetic. First, `advance` / `new-run` only validated *the single line they
were about to touch*, which left four reproducible ways to step over a budget (or to launder an already-illegal
state file) — all fixed, with the suite grown from 22 to 34 cases. Second, honesty and coverage: v0.5.0 described
the controller's enforcement in absolute terms ("the limit cannot be talked around"), which overstates what a CLI
can do, and the host-level gate that actually adds hard enforcement was not written down anywhere. Both are
corrected here, without inflating the new facts either.

### Added
- **Host-level hard gate, documented for the first time (DSH only).** The profile plugin `n3-budget-gate`, registered
  on the DSH `tools/pre-execute` waterfall, consults `node tools/runstate.js gate <project-root>` before dispatching.
  Its enforcement surface is deliberately narrow, and all three limits below are part of the design:
  - **Dispatch-class tools only** — `subagent` / `subagent_fork` / `workflow` / `ralph`. `pwsh` / shell / `read` /
    `write` / `edit` and every other execution- or I/O-class tool are **not** gated, on purpose: an exhausted budget
    must not lock the agent out of `runstate.js` itself, which would deadlock the session.
  - **Unmanaged projects pass** — no `RUN_STATE.md` in the project root (exact-root, no upward walk) means there is
    no budget to enforce, so the dispatch goes through with a one-time notice.
  - **Fail-open when the gate is absent** — if the plugin is missing, unloaded, overridden or throwing internally,
    the gate silently disappears and dispatch proceeds ungated. The **only fail-closed** case is a *managed project*
    whose controller misbehaves (crash / non-JSON / timeout / script missing).
  - `tools/runstate.js` itself remains **checkable but not enforceable**: it refuses an over-budget increment every
    time it is invoked, and constrains nothing if it is never invoked. The host gate is the only hard layer, and it
    covers the dispatch checkpoint only.
- **The gate now ships in the repository**, not just in one profile: `plugin/dsh-budget-gate/index.mjs` is
  byte-identical (SHA256 `E4AC33F9BA588C2D724EEF08540612818D894696F7964D64509A0090ACBBC790`) to the plugin actually
  running on the author's machine, with `plugin/dsh-budget-gate/README.md` covering the install snippet (profile-side
  `.mjs` + the `cordis.patch.yml` `insert` block), the six decision rules, the fail-open/closed boundary, backup and
  rollback, and the audit path. Reproducibility was the gap: v0.5's only hard layer could not be rebuilt from the
  repository at all.
- `README.md` §**Enforcement boundary** and both `references/production-control.md` (EN/ZH) now carry the same three
  statements (dispatch-class only · unmanaged projects pass · fail-open when the plugin is absent), so no document
  claims an unbounded "mechanically enforced".
- Local git tags **`v0.4.0` / `v0.4.1` / `v0.5.0`** now exist on the matching commits and agree with the remote refs
  (the remote already carried `v0.5.0`), so `git log v0.5.0..v0.5.1` actually walks the release history.

### Changed
- The v0.5.0 entry below is kept for the record but its unconditional wording is qualified: enforcement is
  mechanical **for every command that goes through the controller**, not for the agent as a whole.
- `scripts/validate-skills.mjs` version consistency now also covers
  `plugin/dsh-personal-dev-workflow/package.json` (must equal the root `package.json`), closing the last place a
  release number could drift unnoticed.
- `.github/workflows/publish-package.yml` runs `node tools/run-tests.mjs` **before** `npm publish`, so a controller
  regression cannot be published (the push/PR workflow already had the step).

### Fixed
- **`advance` / `new-run` validated only the counter they were changing — seven reproducible findings, all closed.**
  Both commands now run a **whole-file state validation before any write**, and refuse as one unit (exit 1, reason on
  stderr, **file left byte-identical**) whenever any level holds a state error (illegal counter line, duplicate label
  inside one section, missing required counter, value above `Number.MAX_SAFE_INTEGER`) or any limited counter is at
  `current >= limit`. Concretely:
  - **P0-2** — with `Epoch 2 / 2` already at the cap, `advance cards` exited 0 and rewrote the file anyway.
  - **P0-3** — with an illegal line such as `完成卡数: abc / 6` present, `advance repairs` still exited 0 and wrote.
  - **P1-4** — a duplicated counter label inside a budget section was silently accepted.
  - **P1-9** — deleting a required counter line (`已用 Repair`) still let `check` / `gate` pass.
  - **P1-8** — a value beyond `Number.MAX_SAFE_INTEGER` produced a silent no-op with exit 0 instead of an error.
  - **P1-5** — `new-run` **laundered** a hand-edited over-cap value (`完成卡数 99 / 6`) into a legal state. The legal
    exception is now distinguished precisely: Run-level `current == limit` (normal exhaustion) is **allowed** — that
    is what `new-run` is for — while Run-level `current > limit` is a state error and is **refused**.
  - **P1-6** — `new-run` with a Mission counter at its cap (`总卡数 12 / 12` or `Run 3 / 3`) is now **refused** and
    escalates to a human instead of burning Run quota.
  - `status --json`'s `allowNewRun` and `resume` were made to give the same answer as `new-run` for the Run-level
    over-cap case, so the three surfaces can no longer disagree. Backward compatibility is preserved: a legacy file
    with no `## Mission Budget` section still passes `check` (with a warning) and still works with `advance` — a
    wholly absent section is exempt, only a present-but-incomplete one is an error.
- **Stale evidence copies removed.** `docs/evidence/runstate-cli/runstate.js` and
  `docs/evidence/runstate-cli/tests/run-tests.mjs` were frozen snapshots of the v0.4 CLI and its 9-case suite,
  superseded by `tools/runstate.js` and the 34-case `tools/run-tests.mjs`. They were removed (to the recycle bin)
  and replaced by pointers in `docs/evidence/runstate-cli/README.md` and `docs/case-study-bounded-autonomy.md`;
  the run archive (task cards, run summaries, `RUN_STATE.md`, `AGENTS.md`, README) is kept.
- **Conditional test skips are no longer silent passes.** A case skipped because its precondition does not hold
  (e.g. "the project root has no `RUN_STATE.md`") now prints `SKIP` and is excluded from the pass count, instead of
  being counted as a pass. The suite also asserts that passed + skipped + failed equals the total.
- `tools/run-tests.mjs` gained a **second failure-injection point on a different case**
  (`RS_TEST_FORCE_FAIL=2` → the `gate` deny case; `=1` keeps the original `check` case), so the failure path is
  demonstrated on more than one assertion.
- `README.md` §Verification now registers the test suite's temp-directory cleanup as an **approved exception** to
  the "deletions go to the recycle bin" rule (scope locked by a double prefix check; owner-confirmed 2026-09-12),
  and the stale "22 cases" counts were corrected to 34.

## [0.5.0] — 2026-09-12 — Bounded autonomy, mechanically enforced by the controller

v0.4 bounded autonomy was a *methodology*: the budgets and stop conditions were written in prose, and an agent that
ignored them was only disobeying a document. v0.5 moves the check **into the controller** — every increment routed
through `tools/runstate.js` is validated first, an over-budget one is refused, and the state file is left
byte-identical. That is a real constraint on the commands the controller runs, and **only** on those: it is not a
claim that no controller-free path exists. See `references/production-control.md` §10 and the README's
"Enforcement boundary" for what the host gate does and does not cover.

### Added
- `tools/runstate.js` — the zero-dependency controller for `RUN_STATE.md`, promoted from the archived evidence CLI
  into a shipped component. Subcommands: `init` (12-section skeleton) · `check` (strict two-level budget parsing,
  illegal counter lines reported with their line number) · `advance` (counter guards: run-level `epoch` / `cards` /
  `repairs` / `subagents`, mission-level `runs` / `totalcards` / `totalrepairs`) · `status` (`--json` for machines) ·
  `resume` (resume plan: Resume From + next step + whether a new Run is still allowed) · `gate` (the machine gate:
  `{"allow":true,…}` with exit 0, or `{"allow":false,"reason":…}` with exit 1) · `new-run` (Run-level reset with
  mission-level carry-over).
- **Two-level budgets, both enforced mechanically by the controller.** Run Budget (`Epoch` · `完成卡数` · `已用 Repair` ·
  `已派子代理`) protects the context; Mission Budget (`Run` · `总卡数` · `总 Repair`) is the total fuse. A Run-level
  exhaustion is automatic — `new-run` resets the four Run counters, increments Mission `Run`, and keeps the Mission
  totals as memory, so the agent continues in a fresh context without asking a human. Only a Mission-level
  exhaustion escalates to a human. Any increment that would cross either limit is refused with exit 1 and **the
  state file is left byte-identical** (atomic refusal, asserted by hash in the test suite) — for commands that go
  through the controller; the CLI has no power over an agent that never calls it (see the 0.5.1 section and
  the README's "Enforcement boundary").
- `tools/run-tests.mjs` — black-box suite for the controller (22 cases: budget parsing, gate allow/deny, atomic
  refusal by SHA-256, `new-run` semantics, `resume` wording, plus a failure-injection path).
- `package.json` script `test:runstate`, and a CI step running `node tools/run-tests.mjs` alongside the skill
  validator, so the controller cannot regress unnoticed.
- `files` whitelist: `tools/` now ships in the npm package — the controller is the core of v0.5 and has to travel
  with the skill.

### Fixed
- **`new-run` was missing as an entry point.** v0.4 documented "Run exhausted → resume in a new context" but the
  CLI had no way to open that new Run, and `resume` told the user to get human confirmation at every Run boundary —
  which contradicts the two-level design (Run boundaries are automatic, only Mission boundaries ask a human).
  `new-run` now exists, and `resume` at a Run boundary says explicitly that a human is *not* needed.
- **`init` skeleton default `Epoch: 0 / 3` → `0 / 2`.** Documented and recommended default (and the value in
  `production-control.md`) is Run `Epoch ≤ 2`; the generated skeleton contradicted it.

### Changed
- `references/framework.md` (both languages): the default budget block now states the two-level numbers instead of
  the stale single-level "Epoch 3" — Run: epoch ≤ 2 · cards per epoch ≤ 6 · workset ≤ 8 · workers 2 (max 3) ·
  repairs per card ≤ 1 · research pass ≤ 1 · subagent depth ≤ 1; Mission: runs ≤ 3 · total cards ≤ 12 · total
  repairs ≤ 3 — plus the one-line "who handles it" rule (Run exhaustion → automatic `new-run`; Mission exhaustion →
  escalate to a human).
- Both `SKILL.md` frontmatter `version` fields now track the repository release number: they were still `0.4.0`
  while the published package was already `0.4.1`, which is exactly the drift the new validator check prevents.

### Validator
- `scripts/validate-skills.mjs` gains a **version-consistency check**: every canonical `skills/*/SKILL.md`
  frontmatter `version` must equal the repository root `package.json` `version`. A mismatch is a FAIL and exits
  non-zero, so GitHub release number, npm package, plugin bundle and skill metadata can no longer diverge.

## [0.4.1] — 2026-09-12

### Fixed
- Root `package.json` declared `"type": "module"`, which made every `.js` file in the repository ESM and broke the
  CommonJS entry points: `node taskcard-cli.js …` failed with `require is not defined`, and so did the archived
  evidence CLI. The field is now `"commonjs"`, matching what the `.js` files actually are; the repository's ESM
  tooling (`scripts/*.mjs`, CI) is unaffected because `.mjs` is always ESM.

### Added
- `docs/case-study-bounded-autonomy.md` — a three-run worked example on a real project: five cards auto-accepted
  with no per-card sign-off, both stop conditions observed (budget exhausted, DoD met), audit findings held in the
  backlog and later admitted by a new Mission, and a resumed run continuing from `RUN_STATE.md` alone.
- `docs/evidence/runstate-cli/` — the runnable evidence behind that case study: the zero-dependency `runstate` CLI
  (init / check / advance with a mechanical budget guard), its 9-case black-box test suite, the five accepted task
  cards, both run summaries, and the final state file.

## [0.4.0] — 2026-09-12 — Bounded Autonomy

Closes the gap that let an unbounded run happen: the loop governed *one card*, nothing governed *how many cards*.

### Added
- `SKILL.md` §**Bounded autonomy** (the outer controller): Mission envelope · finite workset · numeric budgets ·
  audit/discovery has no execution authority · auto-accept with escalation by exception · stop-and-handoff ·
  one control policy per project.
- `references/production-control.md` — Mission envelope, mode separation (development vs audit), finite workset,
  default budgets, stop conditions, the four human-escalation triggers, resume protocol, anti-patterns.
- `references/run-state-template.md` — the handoff file written at start-of-run and before every stop, so a new
  context resumes by reading it instead of re-reading history.
- Core principle #6: **backlog is memory, not a queue**.

### Changed
- Step 5 (Accept) is now: gates pass + low risk → auto-accept and continue; FAIL → one repair; FAIL again → `BLOCKED`.
  The per-card human sign-off is gone; humans handle the four listed exceptions only.
- Context & cost: budgets are numbers (not "be economical"); the periodic adversarial review runs in Audit Mode,
  which reports and stops.
- Scale: long-running projects use finite epochs + `RUN_STATE.md` resume + 2 workers (max 3); a goal only continues
  an already-defined Mission and must not be used to keep discovering new Missions.
- Task-card template: adds `Mission` and `Source` (planned / blocker / human-requested); acceptance section now
  PASS → auto-merge, FAIL → 1 repair, FAIL again → BLOCKED, plus the escalation triggers.
- Verify checklist: adds budget/stop-state checks and the conductor-side repair budget; wrap-up no longer requires
  per-card human acceptance.

## [0.3.1] — 2026-09-07

### Changed
- Restructured the repository to the standard `skills/<name>/SKILL.md` layout so the open ecosystem discovers both skills:
  `npx skills add satan9394/dsh-personal-dev-workflow` now lists `personal-dev-workflow` and `personal-dev-workflow-zh`.
- Shortened both descriptions to single-line quoted values (strict YAML parsers reject unquoted `": "` inside a scalar).
- `personal-dev-workflow-zh` now has its own skill name matching its folder (previously shared the English name).

### Added
- `scripts/validate-skills.mjs` + GitHub Actions workflow validating frontmatter, referenced files, and
  byte-identical packaged copies (plugin bundle and `dist/` packages) on every push.
- `scripts/sync-copies.mjs` — regenerates every packaged copy from `skills/`, which is the single source of truth.
- `CHANGELOG.md`, `.gitattributes`.
- Repository topics and description for discoverability.
- GitHub Packages publishing: `@satan9394/dsh-personal-dev-workflow` via `.github/workflows/publish-package.yml`
  (runs on release published, or manually via workflow dispatch; validates skills before `npm publish`).

## [0.3.0] — 2026-09-07

### Added
- Bilingual release: English (default) and Chinese variants, each with four templates
  (task card, SPEC, verification checklist, framework background).
- `plugin/dsh-personal-dev-workflow` — DSH bundle plugin shipping both skills.
- `dist/skillhub-pkg-en` / `dist/skillhub-pkg-zh` — publish packages.
- `demos/` — three static visualizations (industry research, workflow, skill itself).
- Published to Tencent SkillHub (`personal-dev-workflow` v0.3.1, `personal-dev-workflow-zh` v0.3.0).

### Changed
- Lean pass: skill body reduced from 147 to 67 lines by removing cross-section duplication and moving explanatory
  material into `references/framework.md`.

## [0.1.0] — 2026-09-06

### Added
- Initial `personal-dev-workflow` skill: five principles, six-step task-card loop, rule-file discipline,
  context & cost rules, scale guidance, and a self-check list.
- `taskcard-cli.js` — zero-dependency CLI for managing the `tasks/` board.
