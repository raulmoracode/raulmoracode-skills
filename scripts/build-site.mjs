#!/usr/bin/env node
/**
 * Builds the static site that GitHub Pages serves, mimicking exactly how
 * OpenCode v2 downloads a remote skills catalog:
 *
 *   GET <base>/index.json
 *   GET <base>/<encodeURIComponent(name)>/<file>
 *
 * The build is intentionally dumb: clean _site/, copy index.json, then copy
 * every file listed in the catalog to _site/<name>/<file>. Finally it writes
 * _site/catalogue.html from index.json and the frontmatter descriptions, so
 * the browsable page cannot drift from the catalog. Run
 * scripts/validate.mjs first; this script still fails loudly on malformed
 * input or missing files.
 *
 * Zero dependencies. Run with: node scripts/build-site.mjs
 */
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync, cpSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { writeCatalogue } from "./build-catalogue.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = join(ROOT, "_site");
const INDEX_FILE = join(ROOT, "index.json");
const CATALOG_VERSION_FILE = join(ROOT, "catalog-version.json");

function fail(message) {
  console.error(`FAIL  ${message}`);
  process.exit(1);
}

let raw;
try {
  raw = readFileSync(INDEX_FILE, "utf8");
} catch (error) {
  fail(`cannot read index.json: ${error.message}`);
}

let catalog;
try {
  catalog = JSON.parse(raw);
} catch (error) {
  fail(`index.json is not valid JSON: ${error.message}`);
}

if (
  typeof catalog !== "object" ||
  catalog === null ||
  !Array.isArray(catalog.skills)
) {
  fail('index.json must have the shape { "skills": [ ... ] }');
}

rmSync(SITE, { recursive: true, force: true });
mkdirSync(SITE, { recursive: true });

writeFileSync(join(SITE, "index.json"), raw);
console.log("copied index.json -> _site/index.json");

let catalogVersion;
try {
  catalogVersion = readFileSync(CATALOG_VERSION_FILE, "utf8");
  JSON.parse(catalogVersion);
} catch (error) {
  fail(`cannot read a valid catalog-version.json: ${error.message}`);
}
writeFileSync(join(SITE, "catalog-version.json"), catalogVersion);
console.log("copied catalog-version.json -> _site/catalog-version.json");

const missing = [];
for (const skill of catalog.skills) {
  for (const file of skill.files ?? []) {
    const source = join(ROOT, "skills", skill.name, file);
    if (!existsSync(source) || !statSync(source).isFile()) {
      missing.push(`skills/${skill.name}/${file}`);
    }
  }
}
if (missing.length > 0) {
  fail(`files listed in index.json are missing on disk:\n  ${missing.join("\n  ")}`);
}

let copied = 0;
for (const skill of catalog.skills) {
  const skillDirName = encodeURIComponent(skill.name);
  for (const file of skill.files ?? []) {
    const source = join(ROOT, "skills", skill.name, file);
    const target = join(SITE, skillDirName, ...file.split("/"));
    mkdirSync(dirname(target), { recursive: true });
    cpSync(source, target);
    copied += 1;
    console.log(`copied skills/${skill.name}/${file} -> _site/${skillDirName}/${file}`);
  }
}

const catalogue = writeCatalogue({ root: ROOT, siteDir: SITE });
console.log(
  `wrote _site/catalogue.html (${catalogue.count} skills, catalog ${catalogue.catalogVersion})`,
);

console.log(`\nBuilt _site with index.json and ${copied} skill file${copied === 1 ? "" : "s"}.`);
