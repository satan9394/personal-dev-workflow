#!/usr/bin/env node
/** Check that the skill has one content everywhere it is installed.
 *
 * The real local chain is: 丙区 (the skills-manager `local` source) →
 * `~/.skills-manager/skills/personal-dev-workflow` (the central copy every agent
 * actually reads) → one junction per agent directory. Refreshing only 丙区 changes
 * nothing for any agent, so the three places have to be compared explicitly.
 *
 * Read-only and dependency-free: it hashes files, prints the differences and exits.
 * It never writes, never creates links and never touches skills-manager.db.
 *
 *   node scripts/verify-distribution.mjs
 *   node scripts/verify-distribution.mjs --source <dir> --mirror <dir> --target <dir>...
 *   node scripts/verify-distribution.mjs --strict   # a missing target fails too
 *
 * Exit codes: 0 everything present matches (missing targets only reported),
 *             1 a content difference, or 2 when the source or mirror cannot be read.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { createHash } from 'node:crypto';

const home = homedir();
const skillName = 'personal-dev-workflow';

/** The 11 agent skill roots that carry a junction to the central copy. */
const AGENT_SKILL_DIRS = [
  '.claude/skills',
  '.codex/skills',
  '.config/opencode/skills',
  '.copilot/skills',
  '.cursor/skills',
  '.dsh/skills',
  '.gemini/antigravity/skills',
  '.kimi-code/skills',
  '.minimax/skills',
  '.omp/agent/skills',
  '.pi/agent/skills',
];

function usage(message) {
  if (message) console.error(`verify-distribution: ${message}`);
  console.error('usage: node scripts/verify-distribution.mjs [--source <dir>] [--mirror <dir>] [--target <dir>]... [--strict]');
  process.exit(2);
}

function parseArgs(argv) {
  const options = {
    source: join(home, '.agents_four_skills', skillName),
    mirror: join(home, '.skills-manager', 'skills', skillName),
    targets: AGENT_SKILL_DIRS.map(dir => join(home, dir, skillName)),
    strict: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--strict') { options.strict = true; continue; }
    if (arg === '--help' || arg === '-h') usage();
    const value = argv[i + 1];
    if (arg === '--source' || arg === '--mirror' || arg === '--target') {
      if (!value) usage(`${arg} needs a directory`);
      i += 1;
    }
    if (arg === '--source') { options.source = resolve(value); continue; }
    if (arg === '--mirror') { options.mirror = resolve(value); continue; }
    if (arg === '--target') { options.targets.push(resolve(value)); continue; }
    usage(`unknown argument: ${arg}`);
  }
  return options;
}

/** Every file under `root` as `relative/path` with forward slashes, or null when root is absent. */
function listFiles(root) {
  if (!existsSync(root) || !statSync(root).isDirectory()) return null;
  const walk = (dir, prefix) => readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return walk(full, relative);
    return entry.isFile() ? [relative] : [];
  });
  return walk(root, '').sort();
}

/** first 8 hex chars of a file's sha256, or 'missing' when the file is not there. */
function hashFile(root, relative) {
  const full = join(root, relative);
  if (!existsSync(full)) return 'missing';
  return createHash('sha256').update(readFileSync(full)).digest('hex').slice(0, 8);
}

/** Shrink a home-rooted path to `~/...` so the output stays readable. */
const label = dir => `${dir.startsWith(home) ? `~${dir.slice(home.length).replace(/\\/g, '/')}` : dir}`;

function describeDirectory(root) {
  return listFiles(root);
}

const options = parseArgs(process.argv.slice(2));
const sourceFiles = describeDirectory(options.source);
if (sourceFiles === null) {
  console.error(`verify-distribution: source is not a directory: ${options.source}`);
  process.exit(2);
}
const mirrorFiles = describeDirectory(options.mirror);
if (mirrorFiles === null) {
  console.error(`verify-distribution: mirror is not a directory: ${options.mirror}`);
  process.exit(2);
}

const differences = [];
const missing = [];

/** Compare one copy against the source; a file-set mismatch counts as a difference too. */
function compare(peerDir, peerFiles, peerLabel) {
  if (peerFiles === null) {
    missing.push(peerLabel);
    console.log(`missing ${peerLabel}`);
    return;
  }
  const names = [...new Set([...sourceFiles, ...peerFiles])].sort();
  for (const relative of names) {
    const sourceHash = hashFile(options.source, relative);
    const peerHash = hashFile(peerDir, relative);
    if (sourceHash === peerHash) continue;
    differences.push({ peer: peerLabel, relative, sourceHash, peerHash });
    console.log(`differ  ${relative}  source=${sourceHash} ${peerLabel}=${peerHash}`);
  }
}

compare(options.mirror, mirrorFiles, 'mirror');
const present = [];
for (const target of options.targets) {
  const peerFiles = describeDirectory(target);
  if (peerFiles !== null) present.push(target);
  compare(target, peerFiles, label(target));
}

const summary = `source=${sourceFiles.length} mirror=${mirrorFiles.length} targets=${present.length} differing=${differences.length} missing=${missing.length}`;
console.log(summary);
const failed = differences.length > 0 || (options.strict && missing.length > 0);
if (failed) {
  console.error(`verify-distribution: ${differences.length} differing file(s)${options.strict && missing.length ? `, ${missing.length} missing target(s)` : ''}`);
}
process.exit(failed ? 1 : 0);
