#!/usr/bin/env node
/**
 * Version-bump guard for pull requests.
 *
 * For every skill whose files changed versus the PR base (equivalent to
 * `git diff <base>...HEAD --name-only -- skills/<name>/`), the skill's
 * `version` in index.json must differ from the version at the base commit.
 * OpenCode only re-downloads a skill when its version changes, so forgetting
 * the bump silently ships stale content to every consumer.
 *
 * Environment:
 *   BASE_REF  base branch name (default: "main"); compared as origin/<BASE_REF>
 *
 * Zero dependencies. Run with: BASE_REF=main node scripts/check-version-bump.mjs
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASE_REF = process.env.BASE_REF ?? "main";
const BASE = `origin/${BASE_REF}`;

function git(...args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
}

function suggestBump(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version ?? "");
  if (match) return `${match[1]}.${match[2]}.${Number(match[3]) + 1}`;
  return `${version ?? "x.y.z"}-next`;
}

try {
  git("rev-parse", "--verify", "--quiet", `${BASE}^{commit}`);
} catch {
  console.error(
    `FAIL  base ref ${BASE} not found. Fetch it first (e.g. git fetch origin ${BASE_REF}).`,
  );
  process.exit(1);
}

let currentCatalog;
try {
  currentCatalog = JSON.parse(readFileSync(join(ROOT, "index.json"), "utf8"));
} catch (error) {
  console.error(`FAIL  cannot read/parse index.json: ${error.message}`);
  process.exit(1);
}

const currentVersions = new Map();
for (const skill of currentCatalog.skills ?? []) {
  if (typeof skill?.name === "string") currentVersions.set(skill.name, skill.version);
}

const baseVersions = new Map();
let baseRaw = null;
try {
  baseRaw = git("show", `${BASE}:index.json`);
} catch {
  console.warn(`warning: index.json not found at ${BASE}; treating every skill as new`);
}
if (baseRaw !== null) {
  let baseCatalog;
  try {
    baseCatalog = JSON.parse(baseRaw);
  } catch (error) {
    console.error(`FAIL  index.json at ${BASE} is not valid JSON: ${error.message}`);
    process.exit(1);
  }
  for (const skill of baseCatalog.skills ?? []) {
    if (typeof skill?.name === "string") baseVersions.set(skill.name, skill.version);
  }
}

const diffOutput = git("diff", "--name-only", `${BASE}...HEAD`, "--", "skills/");
const changedSkills = new Set();
for (const line of diffOutput.split("\n")) {
  const match = line.match(/^skills\/([^/]+)\//);
  if (match) changedSkills.add(match[1]);
}

if (changedSkills.size === 0) {
  console.log(`No skill files changed versus ${BASE}; nothing to check.`);
  process.exit(0);
}

let failed = false;
for (const name of [...changedSkills].sort()) {
  const baseVersion = baseVersions.get(name);
  const currentVersion = currentVersions.get(name);

  if (currentVersion === undefined) {
    if (baseVersion === undefined) {
      console.error(
        `FAIL  ${name}: skill files changed but the skill is not listed in index.json`,
      );
      failed = true;
    } else {
      console.log(
        `info  ${name}: removed from the catalog (was ${baseVersion} at base); skipping version check`,
      );
    }
    continue;
  }

  if (baseVersion === undefined) {
    console.log(`ok    ${name}: new skill at version ${currentVersion}; no bump required`);
    continue;
  }

  if (baseVersion === currentVersion) {
    console.error(
      `FAIL  ${name}: files changed but version is still ${currentVersion}.`,
    );
    console.error(
      `      Bump "version" in index.json (e.g. to ${suggestBump(currentVersion)}) so OpenCode re-downloads the skill.`,
    );
    failed = true;
  } else {
    console.log(`ok    ${name}: version ${baseVersion} -> ${currentVersion}`);
  }
}

if (failed) {
  console.error("\nVersion-bump guard FAILED.");
  process.exit(1);
}
console.log("\nVersion-bump guard passed.");
