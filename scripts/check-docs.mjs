#!/usr/bin/env node
/** Compare the documented distribution facts with this machine and this repository.
 *
 * The facts themselves live in DEPLOYMENT.md section 1; this script checks that the
 * documents, the host configuration and the filesystem still agree with them.
 * Read-only, dependency-free: it never writes, links or calls the network.
 *
 *   node scripts/check-docs.mjs
 *   node scripts/check-docs.mjs --strict   # a skipped environment check also fails
 *   node scripts/check-docs.mjs --json
 *
 * Exit codes: 0 all checks pass (or skipped without --strict), 1 a check failed,
 *             2 a usage or repository read error.
 */
import { readFileSync, existsSync, readdirSync, realpathSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const home = homedir();
const skillName = 'personal-dev-workflow';
const skillDir = join(repo, 'skills', skillName);
const central = join(home, '.skills-manager', 'skills', skillName);
const openCodeJson = join(home, '.config', 'opencode', 'opencode.json');
const dshProfile = join(home, '.dsh', 'profiles', 'web', 'cordis.patch.yml');
const agentSkillDirs = [
  '.claude/skills', '.codex/skills', '.config/opencode/skills', '.copilot/skills', '.cursor/skills',
  '.dsh/skills', '.gemini/antigravity/skills', '.kimi-code/skills', '.minimax/skills',
  '.omp/agent/skills', '.pi/agent/skills',
];
/** Phrases the documents must no longer use now that DEPLOYMENT section 1 is authoritative. */
const staleClaims = ['single reading location', '唯一读位', '不再用 junction', 'opencode.json#skills', '38 fixture'];

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const asJson = args.includes('--json');
for (const arg of args) {
  if (!['--strict', '--json'].includes(arg)) {
    console.error(`check-docs: unknown argument ${arg}`);
    process.exit(2);
  }
}

const results = [];
const record = (id, state, detail) => results.push({ id, state, detail });
const read = file => readFileSync(file, 'utf8');
const countFiles = dir => readdirSync(dir, { withFileTypes: true })
  .reduce((total, entry) => total + (entry.isDirectory() ? countFiles(join(dir, entry.name)) : 1), 0);

function checkFileCount() {
  const deployment = read(join(repo, 'DEPLOYMENT.md'));
  const documented = deployment.match(/\|\s*技能文件数\s*\|\s*(\d+)/);
  if (!documented) return record('skill-file-count', 'FAIL', 'DEPLOYMENT section 1 has no 技能文件数 row');
  if (!existsSync(skillDir)) return record('skill-file-count', 'FAIL', 'skills/personal-dev-workflow is missing');
  const actual = countFiles(skillDir);
  const expected = Number(documented[1]);
  record('skill-file-count', actual === expected ? 'ok' : 'FAIL', `${actual} files (documented ${expected})`);
}

function checkOpenCodeKey() {
  if (!existsSync(openCodeJson)) return record('opencode-skills-key', 'skip', `${openCodeJson} not found`);
  let config;
  try { config = JSON.parse(read(openCodeJson)); } catch (error) { return record('opencode-skills-key', 'FAIL', `cannot parse: ${error.message}`); }
  const hasKey = Object.prototype.hasOwnProperty.call(config, 'skills');
  record('opencode-skills-key', hasKey ? 'FAIL' : 'ok', hasKey ? 'opencode.json declares a skills key; DEPLOYMENT says it does not' : 'no skills key in opencode.json');
}

function checkDshDirs() {
  if (!existsSync(dshProfile)) return record('dsh-custom-skill-dirs', 'skip', `${dshProfile} not found`);
  const text = read(dshProfile);
  if (!/customSkillDirs\s*:/.test(text)) return record('dsh-custom-skill-dirs', 'FAIL', 'customSkillDirs not declared');
  const empty = /customSkillDirs\s*:\s*\[\s*\]/.test(text);
  record('dsh-custom-skill-dirs', empty ? 'ok' : 'FAIL', empty ? 'customSkillDirs is []' : 'customSkillDirs is not empty; DEPLOYMENT says []');
}

function checkJunctions() {
  if (!existsSync(central)) return record('junction-targets', 'skip', `${central} not found`);
  let target;
  try { target = realpathSync.native(central); } catch (error) { return record('junction-targets', 'FAIL', `cannot resolve central copy: ${error.message}`); }
  const present = agentSkillDirs.map(dir => join(home, dir, skillName)).filter(path => existsSync(path));
  if (!present.length) return record('junction-targets', 'skip', 'no agent skill directory holds the skill');
  const wrong = [];
  for (const path of present) {
    let resolved;
    try { resolved = realpathSync.native(path); } catch { wrong.push(`${path} (unresolvable)`); continue; }
    if (resolved !== target) wrong.push(`${path} -> ${resolved}`);
  }
  if (wrong.length) return record('junction-targets', 'FAIL', wrong.join('; '));
  record('junction-targets', 'ok', `${present.length} junctions point at the central copy`);
}

function checkReadmeCount() {
  const readme = read(join(repo, 'README.md'));
  const documented = readme.match(/(\d+)\s+fixture orchestration cases/);
  if (!documented) return record('readme-test-count', 'FAIL', 'README has no fixture-count sentence');
  const suite = read(join(skillDir, 'scripts', 'pdw.test.mjs'));
  const actual = (suite.match(/await test\(/g) ?? []).length;
  const expected = Number(documented[1]);
  record('readme-test-count', actual === expected ? 'ok' : 'FAIL', `README says ${expected}, suite has ${actual}`);
}

function checkStaleClaims() {
  const files = ['README.md', 'AGENTS.md', 'DEPLOYMENT.md', 'RELEASING.md'];
  const hits = [];
  for (const name of files) {
    const text = read(join(repo, name));
    for (const phrase of staleClaims) if (text.includes(phrase)) hits.push(`${name}: ${phrase}`);
  }
  record('no-stale-claims', hits.length ? 'FAIL' : 'ok', hits.length ? hits.join('; ') : 'no retired phrases');
}

function checkUnpublished() {
  const pkg = JSON.parse(read(join(repo, 'package.json')));
  const files = Array.isArray(pkg.files) ? pkg.files : [];
  const hit = files.find(entry => String(entry).includes('.opencode'));
  record('opencode-unpublished', hit ? 'FAIL' : 'ok', hit ? `package.json.files includes ${hit}` : '.opencode/ is not published');
}

try {
  checkFileCount();
  checkOpenCodeKey();
  checkDshDirs();
  checkJunctions();
  checkReadmeCount();
  checkStaleClaims();
  checkUnpublished();
} catch (error) {
  console.error(`check-docs: ${error.message}`);
  process.exit(2);
}

const failed = results.filter(r => r.state === 'FAIL');
const skipped = results.filter(r => r.state === 'skip');
const summary = { ok: results.length - failed.length - skipped.length, skip: skipped.length, fail: failed.length };

if (asJson) {
  console.log(JSON.stringify({ checks: results, summary, strict }, null, 2));
} else {
  for (const r of results) console.log(`${r.state.padEnd(4)}  ${r.id.padEnd(22)}  ${r.detail}`);
  console.log(`${results.length} checks: ${summary.ok} ok, ${summary.skip} skip, ${summary.fail} fail`);
}
process.exit(failed.length || (strict && skipped.length) ? 1 : 0);
