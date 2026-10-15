#!/usr/bin/env node
/**
 * Validates this repository as an OpenCode v2 remote skills catalog.
 *
 * Contract (OpenCode v2.0.29):
 *   GET <base>/index.json -> {"skills":[{"name":string,"version"?:string,"files":string[]}]}
 *   GET <base>/<encodeURIComponent(name)>/<file>
 *
 * Checks performed:
 *   - index.json exists and parses as JSON
 *   - the top-level shape is exactly { "skills": [...] }
 *   - every entry has a valid kebab-case name, a non-empty version string and a
 *     non-empty array of safe, unique relative file paths
 *   - list entries include <name>.md or SKILL.md
 *   - every listed file exists at skills/<name>/<file>
 *   - the entry markdown frontmatter contains name and description
 *   - every directory under skills/ is listed in index.json (no orphans)
 *   - every listed support file is referenced by an explicit relative path in
 *     the skill body — OpenCode does not auto-load supporting files, so a file
 *     nothing points at is dead weight the agent will never read
 *   - the entry markdown has an "## Interaction with other skills" section
 *   - the sibling names that section mentions are real skills in the catalog,
 *     which catches references to renamed or retired skills
 *   - no long prose block is duplicated across skills, which catches the
 *     copy-paste drift that shared guidance is prone to
 *
 * Zero dependencies. Run with: node scripts/validate.mjs
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const INDEX_FILE = join(ROOT, "index.json");
const SKILL_NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ALLOWED_KEYS = ["name", "version", "files"];
const MAX_DESCRIPTION_LENGTH = 1024;

let checks = 0;
let failures = 0;

function ok(message) {
  checks += 1;
  console.log(`  ok    ${message}`);
}

function fail(message, detail) {
  checks += 1;
  failures += 1;
  console.error(`  FAIL  ${message}`);
  if (detail !== undefined) console.error(`        ${detail}`);
}

function section(title) {
  console.log(`\n${title}`);
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSafeRelativePath(value) {
  if (typeof value !== "string" || value.length === 0) return false;
  if (value.startsWith("/")) return false;
  if (value.includes("\\") || value.includes("?") || value.includes("#")) return false;
  const segments = value.split("/");
  return segments.every(
    (segment) => segment.length > 0 && segment !== "." && segment !== "..",
  );
}

function readFrontmatter(filePath) {
  const text = readFileSync(filePath, "utf8");
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/);
  return match ? match[1] : null;
}

function readFrontmatterField(frontmatter, field) {
  const match = frontmatter.match(new RegExp(`^${field}\\s*:\\s*(.+)$`, "m"));
  if (!match) return null;
  let value = match[1].trim();
  if (value.length >= 2) {
    const first = value[0];
    const last = value[value.length - 1];
    const quoted =
      (first === '"' && last === '"') || (first === "'" && last === "'");
    if (quoted) value = value.slice(1, -1).trim();
  }
  return value;
}

function readSection(body, heading) {
  const lines = body.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start === -1) return null;
  const collected = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^## /.test(lines[i])) break;
    collected.push(lines[i]);
  }
  return collected.join("\n");
}

function proseLines(body) {
  const withoutFrontmatter = body.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
  const out = [];
  let fenced = false;
  for (const raw of withoutFrontmatter.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith("```")) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    if (/^[#|>]/.test(line)) continue;
    const content = line.replace(/^[-*]\s+/, "").trim();
    if (content.length < 80) continue;
    out.push(content);
  }
  return out;
}

function checkFileList(entry) {
  const name = entry.name;
  const fileSeen = new Set();
  const problems = [];
  let hasEntryFile = false;
  let entryFileName = null;

  const files = Array.isArray(entry.files) ? entry.files : [];
  for (const file of files) {
    if (!isSafeRelativePath(file)) {
      problems.push(`unsafe path: ${JSON.stringify(file)}`);
      continue;
    }
    if (fileSeen.has(file)) {
      problems.push(`duplicate path: ${JSON.stringify(file)}`);
      continue;
    }
    fileSeen.add(file);
    if (file === `${name}.md` || file === "SKILL.md") {
      hasEntryFile = true;
      if (entryFileName === null) entryFileName = file;
    }
  }

  if (problems.length > 0) {
    fail(`${name}: all file paths are safe, relative and unique`, problems.join("; "));
  } else {
    ok(`${name}: all file paths are safe, relative and unique`);
  }

  if (hasEntryFile) {
    ok(`${name}: files include the entry markdown (${entryFileName})`);
  } else {
    fail(`${name}: files include ${name}.md or SKILL.md`);
  }

  const missing = [];
  for (const file of fileSeen) {
    const absolute = join(ROOT, "skills", name, file);
    if (!existsSync(absolute) || !statSync(absolute).isFile()) {
      missing.push(`skills/${name}/${file}`);
    }
  }
  if (missing.length > 0) {
    fail(`${name}: every listed file exists at skills/${name}/<file>`, missing.join(", "));
  } else {
    ok(`${name}: every listed file exists at skills/${name}/<file>`);
  }

  if (entryFileName !== null) {
    const absolute = join(ROOT, "skills", name, entryFileName);
    if (existsSync(absolute) && statSync(absolute).isFile()) {
      let frontmatter = null;
      try {
        frontmatter = readFrontmatter(absolute);
      } catch (error) {
        fail(`${name}: ${entryFileName} is readable`, error.message);
      }
      if (frontmatter !== null) {
        ok(`${name}: ${entryFileName} starts with YAML frontmatter`);
        const frontmatterName = readFrontmatterField(frontmatter, "name");
        if (frontmatterName === name) {
          ok(`${name}: frontmatter name matches the catalog entry`);
        } else {
          fail(
            `${name}: frontmatter name matches the catalog entry`,
            `found ${JSON.stringify(frontmatterName)}`,
          );
        }
        const description = readFrontmatterField(frontmatter, "description");
        if (
          typeof description === "string" &&
          description.length > 0 &&
          description.length <= MAX_DESCRIPTION_LENGTH
        ) {
          ok(`${name}: frontmatter description present (${description.length} chars)`);
        } else {
          const detail =
            description === null
              ? "field missing"
              : `${description.length} chars (limit ${MAX_DESCRIPTION_LENGTH})`;
          fail(
            `${name}: frontmatter description is a non-empty string of at most ${MAX_DESCRIPTION_LENGTH} chars`,
            detail,
          );
        }
      } else if (frontmatter === null) {
        fail(`${name}: ${entryFileName} starts with YAML frontmatter`);
      }
    }
  }
}

section("index.json");
let catalog = null;
let skills = null;

if (existsSync(INDEX_FILE)) {
  ok("index.json exists at the repository root");
  let raw = null;
  try {
    raw = readFileSync(INDEX_FILE, "utf8");
  } catch (error) {
    fail("index.json is readable", error.message);
  }
  if (raw !== null) {
    try {
      catalog = JSON.parse(raw);
      ok("index.json parses as JSON");
    } catch (error) {
      fail("index.json parses as JSON", error.message);
    }
  }
} else {
  fail("index.json exists at the repository root");
}

if (catalog !== null) {
  if (isPlainObject(catalog)) {
    ok("top-level value is an object");
  } else {
    fail("top-level value is an object", `found ${Array.isArray(catalog) ? "array" : typeof catalog}`);
    catalog = null;
  }
}

if (catalog !== null) {
  const keys = Object.keys(catalog);
  const missingKeys = ["skills"].filter((key) => !keys.includes(key));
  const unexpectedKeys = keys.filter((key) => key !== "skills");
  if (missingKeys.length === 0 && unexpectedKeys.length === 0) {
    ok('top-level keys are exactly ["skills"]');
  } else {
    fail(
      'top-level keys are exactly ["skills"]',
      `missing: [${missingKeys.join(", ")}]; unexpected: [${unexpectedKeys.join(", ")}]`,
    );
  }

  if (Array.isArray(catalog.skills)) {
    skills = catalog.skills;
    ok(`"skills" is an array (${skills.length} entr${skills.length === 1 ? "y" : "ies"})`);
  } else {
    fail('"skills" is an array');
  }
}

if (skills !== null) {
  section("skills");
  const seenNames = new Map();

  if (skills.length === 0) {
    console.log("  info  catalog lists no skills");
  }

  skills.forEach((entry, index) => {
    const fallbackLabel = `entry #${index + 1}`;
    if (!isPlainObject(entry)) {
      fail(`${fallbackLabel}: entry is an object`);
      return;
    }

    const unexpectedKeys = Object.keys(entry).filter((key) => !ALLOWED_KEYS.includes(key));
    if (unexpectedKeys.length > 0) {
      fail(
        `${fallbackLabel}: entry has no keys beyond name/version/files`,
        `unexpected: [${unexpectedKeys.join(", ")}]`,
      );
    }

    if (typeof entry.name !== "string" || !SKILL_NAME_RE.test(entry.name)) {
      fail(`${fallbackLabel}: "name" is a non-empty kebab-case string`);
      return;
    }
    const name = entry.name;
    ok(`${name}: name matches ${SKILL_NAME_RE}`);

    if (seenNames.has(name)) {
      fail(`${name}: name is unique`, `also used by entry #${seenNames.get(name) + 1}`);
    } else {
      seenNames.set(name, index);
    }

    if (typeof entry.version === "string" && entry.version.length > 0) {
      ok(`${name}: "version" is a non-empty string (${entry.version})`);
    } else {
      fail(`${name}: "version" is a non-empty string`);
    }

    if (Array.isArray(entry.files) && entry.files.length > 0) {
      ok(`${name}: "files" is a non-empty array`);
      checkFileList(entry);
    } else {
      fail(`${name}: "files" is a non-empty array`);
    }
  });
}

if (skills !== null) {
  section("references and cross-references");
  const skillNames = new Set(
    skills
      .filter((entry) => isPlainObject(entry) && typeof entry.name === "string")
      .map((entry) => entry.name),
  );
  const bodies = new Map();

  for (const entry of skills) {
    if (!isPlainObject(entry) || typeof entry.name !== "string") continue;
    const name = entry.name;
    const files = Array.isArray(entry.files) ? entry.files : [];
    const entryFile = files.find((file) => file === `${name}.md` || file === "SKILL.md");
    if (entryFile === undefined) continue;

    const absolute = join(ROOT, "skills", name, entryFile);
    if (!existsSync(absolute) || !statSync(absolute).isFile()) continue;

    const body = readFileSync(absolute, "utf8");
    bodies.set(name, body);

    const unreferenced = files.filter(
      (file) => file !== entryFile && !body.includes(file),
    );
    if (unreferenced.length > 0) {
      fail(
        `${name}: every listed support file is referenced by path in ${entryFile}`,
        `never named in the body: ${unreferenced.join(", ")}`,
      );
    } else {
      ok(`${name}: listed support files are referenced by path in the body`);
    }

    const interaction = readSection(body, "Interaction with other skills");
    if (interaction === null) {
      fail(`${name}: entry markdown has an "## Interaction with other skills" section`);
      continue;
    }

    const unknown = [];
    for (const match of interaction.matchAll(/`([a-z0-9]+(?:-[a-z0-9]+)*)`/g)) {
      const token = match[1];
      if (!skillNames.has(token) && !unknown.includes(token)) unknown.push(token);
    }
    if (unknown.length > 0) {
      fail(
        `${name}: sibling names in the interaction section are real skills`,
        `not in the catalog: ${unknown.map((token) => `"${token}"`).join(", ")}`,
      );
    } else {
      ok(`${name}: interaction section names real sibling skills`);
    }
  }

  const skillsDir = join(ROOT, "skills");
  const onDisk = existsSync(skillsDir)
    ? readdirSync(skillsDir, { withFileTypes: true })
        .filter((item) => item.isDirectory())
        .map((item) => item.name)
    : [];
  const orphans = onDisk.filter((name) => !skillNames.has(name));
  if (orphans.length > 0) {
    fail(
      "every directory under skills/ is listed in index.json",
      `not listed: ${orphans.join(", ")}`,
    );
  } else {
    ok(`every directory under skills/ is listed in index.json (${onDisk.length})`);
  }

  const lineOwners = new Map();
  for (const [name, body] of bodies) {
    for (const line of proseLines(body)) {
      if (!lineOwners.has(line)) lineOwners.set(line, []);
      lineOwners.get(line).push(name);
    }
  }
  const duplicated = [...lineOwners.entries()]
    .map(([line, owners]) => [line, [...new Set(owners)]])
    .filter(([, owners]) => owners.length > 1);
  if (duplicated.length > 0) {
    fail(
      "no long prose block is duplicated across skills",
      duplicated
        .slice(0, 3)
        .map(([line, owners]) => `[${owners.join(", ")}] ${line.slice(0, 60)}...`)
        .join("; "),
    );
  } else {
    ok("no long prose block is duplicated across skills");
  }
}

section("summary");
if (failures > 0) {
  console.error(`  ${checks} checks run, ${failures} failed`);
  console.error(`\nCatalog validation FAILED (${failures} problem${failures === 1 ? "" : "s"}).`);
  process.exit(1);
}
console.log(`  ${checks} checks run, 0 failed`);
console.log("\nCatalog validation passed.");
