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
 *   - the entry markdown has a compact, parseable "## Composition" contract
 *   - composition roles, invocation values, support budgets, depths and operational
 *     references are valid; support chains and cycles are rejected
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
const CATALOG_VERSION_FILE = join(ROOT, "catalog-version.json");
const SKILL_NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ALLOWED_KEYS = ["name", "version", "files"];
const MAX_DESCRIPTION_LENGTH = 1024;
const COMPOSITION_ROLES = new Set(["orchestrator", "specialist", "support", "policy"]);
const COMPOSITION_INVOCATION_VALUES = new Set(["yes", "no"]);
const COMPOSITION_BLOCK_RE =
  /```yaml\r?\n([\s\S]*?)\r?\n```/;
const STRICT_COMPOSITION = true;

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

function isSemver(value) {
  return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(value);
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

function parseComposition(body) {
  const section = readSection(body, "Composition");
  if (section === null) return { section: null, metadata: null, errors: [] };
  const match = section.match(COMPOSITION_BLOCK_RE);
  if (!match) {
    return {
      section,
      metadata: null,
      errors: ['section must contain one fenced ```yaml metadata block'],
    };
  }
  const metadata = {};
  const errors = [];
  for (const line of match[1].split(/\r?\n/)) {
    if (line.trim() === "") continue;
    const field = line.match(/^([a-z-]+):\s*(.+)$/);
    if (!field) {
      errors.push(`invalid metadata line: ${line}`);
      continue;
    }
    const [, key, rawValue] = field;
    if (Object.hasOwn(metadata, key)) {
      errors.push(`duplicate metadata field: ${key}`);
      continue;
    }
    metadata[key] = rawValue.trim();
  }
  return { section, metadata, errors };
}

function parseSupportList(value) {
  if (value === "[]") return [];
  if (!value || !value.startsWith("[") || !value.endsWith("]")) return null;
  const contents = value.slice(1, -1).trim();
  if (contents === "") return [];
  const names = contents.split(",").map((item) => item.trim());
  return names.every((name) => /^`?[a-z0-9]+(?:-[a-z0-9]+)*`?$/.test(name))
    ? names.map((name) => name.replaceAll("`", ""))
    : null;
}

function parseSupportLimit(value) {
  if (/^\d+$/.test(value)) return { min: Number(value), max: Number(value) };
  const match = value?.match(/^(\d+)-(\d+)$/);
  if (!match) return null;
  const min = Number(match[1]);
  const max = Number(match[2]);
  return min <= max ? { min, max } : null;
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

  section("catalog-version.json");
  let catalogVersion = null;
  try {
    catalogVersion = JSON.parse(readFileSync(CATALOG_VERSION_FILE, "utf8"));
  } catch (error) {
    fail("catalog-version.json is readable and valid JSON", error.message);
  }

  if (catalogVersion !== null) {
    if (
      !isPlainObject(catalogVersion) ||
      Object.keys(catalogVersion).length !== 1 ||
      typeof catalogVersion.version !== "string" ||
      !isSemver(catalogVersion.version)
    ) {
      fail(
        'catalog-version.json has the exact { "version": "semver" } shape',
        'expected a single semver "version" string',
      );
    } else {
      ok(`catalog version is ${catalogVersion.version}`);
    }
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
  const compositions = new Map();

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

    const composition = parseComposition(body);
    if (composition.section === null) {
      if (STRICT_COMPOSITION) {
        fail(`${name}: entry markdown has a "## Composition" section`);
      }
    } else if (composition.metadata === null) {
      fail(`${name}: Composition section is parseable`, composition.errors.join("; "));
    } else {
      const required = [
        "role",
        "direct-invocation",
        "support-limit",
        "max-depth",
        "supports",
      ];
      const missing = required.filter((field) => !Object.hasOwn(composition.metadata, field));
      const unexpected = Object.keys(composition.metadata).filter(
        (field) => !required.includes(field),
      );
      if (missing.length > 0 || unexpected.length > 0 || composition.errors.length > 0) {
        const details = [
          missing.length > 0 ? `missing: ${missing.join(", ")}` : null,
          unexpected.length > 0 ? `unexpected: ${unexpected.join(", ")}` : null,
          ...composition.errors,
        ]
          .filter(Boolean)
          .join("; ");
        fail(`${name}: Composition metadata has the required fields`, details);
      } else {
        const metadata = composition.metadata;
        const supportLimit = parseSupportLimit(metadata["support-limit"]);
        const maxDepth = Number(metadata["max-depth"]);
        const supports = parseSupportList(metadata.supports);
        const localErrors = [];
        if (!COMPOSITION_ROLES.has(metadata.role)) {
          localErrors.push(`invalid role ${JSON.stringify(metadata.role)}`);
        }
        if (!COMPOSITION_INVOCATION_VALUES.has(metadata["direct-invocation"])) {
          localErrors.push(
            `invalid direct-invocation ${JSON.stringify(metadata["direct-invocation"])}`,
          );
        }
        if (
          supportLimit === null ||
          supportLimit.min < 0 ||
          supportLimit.max > 3
        ) {
          localErrors.push("support-limit must be a range within 0-3");
        }
        if (!Number.isInteger(maxDepth) || maxDepth < 0 || maxDepth > 1) {
          localErrors.push("max-depth must be 0 or 1");
        }
        if (supports === null) {
          localErrors.push("supports must be a bracketed list of skill names");
        } else if (supportLimit !== null && supports.length > supportLimit.max) {
          localErrors.push(
            `supports lists ${supports.length} skills but support-limit allows ${supportLimit.max}`,
          );
        } else if (supports.length > 0 && maxDepth === 0) {
          localErrors.push("max-depth must be 1 when supports are declared");
        }
        if (metadata.role === "support" && supports?.length > 0) {
          localErrors.push("support skills cannot compose other skills");
        }
        if (metadata.role !== "orchestrator" && maxDepth > 1) {
          localErrors.push("non-orchestrators cannot declare composition depth above 1");
        }
        if (localErrors.length > 0) {
          fail(`${name}: Composition metadata is valid`, localErrors.join("; "));
        } else {
          compositions.set(name, {
            role: metadata.role,
            supports,
            maxDepth,
          });
          ok(`${name}: Composition metadata is valid`);
        }
      }
    }

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

  for (const [name, composition] of compositions) {
    const unknown = composition.supports.filter((support) => !skillNames.has(support));
    if (unknown.length > 0) {
      fail(
        `${name}: Composition references real catalog skills`,
        `not in the catalog: ${unknown.map((item) => `"${item}"`).join(", ")}`,
      );
      continue;
    }

    const invalidTargets = composition.supports.filter((support) => {
      const target = compositions.get(support);
      return target !== undefined && target.role === "orchestrator";
    });
    if (invalidTargets.length > 0) {
      fail(
        `${name}: Composition does not load orchestrators as support`,
        invalidTargets.map((item) => `"${item}"`).join(", "),
      );
    } else {
      ok(`${name}: Composition references valid operational targets`);
    }
  }

  const visiting = new Set();
  const visited = new Set();
  function visit(name, path = []) {
    if (visiting.has(name)) {
      const cycle = [...path.slice(path.indexOf(name)), name].join(" -> ");
      fail("Composition graph has no operational cycles", cycle);
      return;
    }
    if (visited.has(name)) return;
    const composition = compositions.get(name);
    if (composition === undefined) return;
    visiting.add(name);
    for (const support of composition.supports) visit(support, [...path, name]);
    visiting.delete(name);
    visited.add(name);
  }
  for (const name of compositions.keys()) visit(name);

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
