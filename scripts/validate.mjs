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
 *
 * Zero dependencies. Run with: node scripts/validate.mjs
 */
import { existsSync, readFileSync, statSync } from "node:fs";
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

section("summary");
if (failures > 0) {
  console.error(`  ${checks} checks run, ${failures} failed`);
  console.error(`\nCatalog validation FAILED (${failures} problem${failures === 1 ? "" : "s"}).`);
  process.exit(1);
}
console.log(`  ${checks} checks run, 0 failed`);
console.log("\nCatalog validation passed.");
