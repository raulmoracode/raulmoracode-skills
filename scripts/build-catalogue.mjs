#!/usr/bin/env node
/**
 * Generates _site/catalogue.html — the browsable index page for the catalog.
 *
 * The page is rebuilt on every site build from two authoritative sources:
 * index.json (names, versions, file lists) and each entry's frontmatter
 * description. Nothing on the page is written by hand, so it cannot drift
 * from the published catalog.
 *
 * scripts/build-site.mjs calls writeCatalogue() after copying the site files.
 * This script can also run alone to regenerate just the page:
 *
 *   node scripts/build-catalogue.mjs
 *
 * Zero dependencies.
 */
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REPO_URL = "https://github.com/raulmoracode/raulmoracode-skills";
const CATALOG_URL = "https://raulmoracode.github.io/raulmoracode-skills/";

function fail(message) {
  throw new Error(`build-catalogue: ${message}`);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function readEntry(root, name, files) {
  const entry = files.find((file) => file === `${name}.md` || file === "SKILL.md");
  if (entry === undefined) fail(`${name}: no entry markdown in its file list`);
  const absolute = join(root, "skills", name, entry);
  if (!existsSync(absolute) || !statSync(absolute).isFile()) {
    fail(`${name}: entry markdown missing at skills/${name}/${entry}`);
  }
  const text = readFileSync(absolute, "utf8");
  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (frontmatter === null) fail(`${name}: entry markdown has no frontmatter`);
  const field = frontmatter[1].match(/^description\s*:\s*(.+)$/m);
  if (field === null) fail(`${name}: frontmatter has no description`);
  let description = field[1].trim();
  if (
    description.length >= 2 &&
    ((description.startsWith('"') && description.endsWith('"')) ||
      (description.startsWith("'") && description.endsWith("'")))
  ) {
    description = description.slice(1, -1);
  }
  if (description.length === 0) fail(`${name}: frontmatter description is empty`);
  return { entry, description };
}

function skillRow(skill) {
  const note =
    skill.name === "raulmoracode-mode"
      ? '<em class="note">the entry point</em>'
      : skill.name === "raulmoracode-catalogue"
        ? '<em class="note">opens this page</em>'
        : "";
  const search = `${skill.name} ${skill.description}`.toLowerCase();
  return `        <article class="skill" data-skill data-search="${escapeHtml(search)}">
          <div class="skill-head">
            <a class="skill-name" href="${escapeHtml(skill.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(skill.name)}</a>
            <span class="version">${escapeHtml(skill.version)}</span>
            ${note}
          </div>
          <p class="description">${escapeHtml(skill.description)}</p>
        </article>`;
}

function renderGroups(skills) {
  const groups = new Map();
  for (const skill of skills) {
    const letter = skill.name.charAt(0).toUpperCase();
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter).push(skill);
  }
  let out = "";
  for (const [letter, members] of groups) {
    out += `    <section class="group" data-group>
      <h2 class="letter">${escapeHtml(letter)}</h2>
${members.map(skillRow).join("\n")}
    </section>
`;
  }
  return out;
}

function renderCatalogue({ skills, catalogVersion, generated }) {
  const count = skills.length;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>raulmoracode catalogue — ${count} skills for OpenCode</title>
<meta name="description" content="Every skill in the raulmoracode-skills catalog for OpenCode: names, versions and descriptions, with install and reload instructions.">
<link rel="icon" href="data:,">
<style>
:root {
  color-scheme: light dark;
  --paper: #f2f4f6;
  --ink: #1b1f26;
  --body: #333a42;
  --muted: #59626d;
  --rule: #d7dce2;
  --hover: #e8ecf0;
  --accent: #8c2f33;
  --panel: #1e242c;
  --panel-ink: #e8eaed;
  --mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  --serif: ui-serif, "New York", "Iowan Old Style", Charter, Georgia, serif;
}
@media (prefers-color-scheme: dark) {
  :root {
    --paper: #14171c;
    --ink: #e8eaed;
    --body: #c8cdd4;
    --muted: #98a1ab;
    --rule: #2a3037;
    --hover: #1b1f25;
    --accent: #d98d92;
    --panel: #1b2027;
  }
}
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--serif);
  line-height: 1.55;
}
::selection { background: var(--accent); color: var(--paper); }
header, main, footer { max-width: 76rem; margin: 0 auto; padding-inline: clamp(1rem, 4vw, 3rem); }
.masthead { padding-top: clamp(2.75rem, 8vw, 5rem); padding-bottom: 1.75rem; }
.masthead h1 {
  margin: 0 0 .8rem;
  font-size: clamp(2.1rem, 6vw, 3.6rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.04;
}
.lede { max-width: 44rem; margin: 0 0 .9rem; font-size: 1.06rem; }
.meta { margin: 0; font-family: var(--mono); font-size: .8rem; color: var(--muted); }
.controls {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: .7rem 0;
  background: var(--paper);
  border-bottom: 1px solid var(--rule);
}
.controls input {
  flex: 1 1 auto;
  min-width: 0;
  font-family: var(--mono);
  font-size: .92rem;
  color: var(--ink);
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--rule);
  border-radius: 0;
  padding: .3rem 0;
}
.controls input::placeholder { color: var(--muted); }
.controls input:focus {
  outline: none;
  border-bottom-color: var(--accent);
  box-shadow: 0 1px 0 0 var(--accent);
}
.count { margin: 0; font-family: var(--mono); font-size: .78rem; color: var(--muted); white-space: nowrap; }
.group { border-top: 1px solid var(--rule); margin-top: 2.25rem; padding-top: 1rem; }
.group[hidden] { display: none; }
.letter { margin: 0 0 .4rem; font-size: 1.45rem; font-weight: 600; }
.skill {
  display: grid;
  grid-template-columns: minmax(15rem, 19rem) minmax(0, 1fr);
  align-items: baseline;
  gap: .1rem 2.25rem;
  padding: .95rem .7rem;
  margin-inline: -.7rem;
  transition: background-color .12s ease;
}
.skill + .skill { border-top: 1px solid var(--rule); }
.skill:hover { background: var(--hover); }
.skill[hidden] { display: none; }
.skill-head { display: flex; align-items: baseline; flex-wrap: wrap; gap: .55rem; margin: 0; }
.skill-name {
  font-family: var(--mono);
  font-size: .98rem;
  font-weight: 600;
  color: var(--ink);
  text-decoration: underline;
  text-decoration-color: var(--rule);
  text-decoration-thickness: 1px;
  text-underline-offset: .24em;
}
.skill-name:hover { color: var(--accent); text-decoration-color: var(--accent); }
.version { font-family: var(--mono); font-size: .76rem; color: var(--muted); }
.note { font-style: italic; font-size: .9rem; color: var(--accent); }
.description { margin: 0; max-width: 62ch; font-size: .97rem; color: var(--body); overflow-wrap: break-word; }
.site-footer { margin-top: 4.5rem; border-top: 1px solid var(--rule); padding: 2.25rem 0 3rem; }
.site-footer h2 { margin: 0 0 1.2rem; font-size: 1.35rem; font-weight: 600; }
.use { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); gap: 2.5rem 3.5rem; align-items: start; }
.use-note { margin: 0 0 .8rem; max-width: 46ch; }
.steps { margin: 0; padding-left: 1.25rem; max-width: 52ch; }
.steps li { margin-bottom: .45rem; }
.steps code, .use-note code { font-family: var(--mono); font-size: .86em; }
.snippet {
  position: relative;
  background: var(--panel);
  color: var(--panel-ink);
  border-radius: 3px;
  padding: 1.1rem 1.2rem;
  max-width: 46rem;
}
.snippet pre { margin: 0; overflow-x: auto; }
.snippet code { font-family: var(--mono); font-size: .85rem; line-height: 1.55; }
#copy {
  position: absolute;
  top: .6rem;
  right: .6rem;
  font-family: var(--mono);
  font-size: .74rem;
  color: var(--panel-ink);
  background: transparent;
  border: 1px solid rgba(232, 234, 237, .35);
  border-radius: 2px;
  padding: .28rem .6rem;
  cursor: pointer;
}
#copy:hover { border-color: #d98d92; color: #d98d92; }
.colophon { margin: 2.5rem 0 0; font-size: .9rem; color: var(--muted); }
.colophon a { color: inherit; text-decoration: underline; text-decoration-color: var(--rule); text-underline-offset: .2em; }
.colophon a:hover { color: var(--accent); text-decoration-color: var(--accent); }
.colophon a + a { margin-left: 1.25rem; }
a:focus-visible, button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@media (max-width: 820px) {
  .skill { grid-template-columns: 1fr; align-items: start; gap: .2rem; }
  .use { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
</style>
</head>
<body>
<header class="masthead">
  <h1>raulmoracode catalogue</h1>
  <p class="lede">Every skill in the catalog, with what each one does. Built from the catalog itself on every deploy, so the versions and descriptions here are the published ones.</p>
  <p class="meta">${count} skills. Catalog version ${escapeHtml(catalogVersion)}. Generated ${escapeHtml(generated)}.</p>
</header>
<main>
  <div class="controls">
    <label class="visually-hidden" for="q">Filter skills by name or description</label>
    <input id="q" type="search" placeholder="Filter by name or description, press / to focus" autocomplete="off" spellcheck="false">
    <p class="count" id="count" role="status" aria-live="polite">${count} skills</p>
  </div>
  <div id="list">
${renderGroups(skills)}  </div>
</main>
<footer class="site-footer">
  <h2>Use this catalogue</h2>
  <div class="use">
    <div>
      <p class="use-note">Add the catalog URL to the <code>skills</code> array in your OpenCode configuration.</p>
      <div class="snippet">
        <pre><code id="snippet">{
  "skills": ["${CATALOG_URL}"]
}</code></pre>
        <button id="copy" type="button" aria-label="Copy the skills configuration">Copy</button>
      </div>
    </div>
    <ol class="steps">
      <li>Run <code>opencode reload</code> after the catalog updates, so OpenCode downloads the changed skills.</li>
      <li>Ask for what you need, or mention <code>@skill-id</code> to load a specific skill.</li>
    </ol>
  </div>
  <p class="colophon">raulmoracode-skills is MIT-licensed. <a href="${REPO_URL}" target="_blank" rel="noopener">Repository</a><a href="${CATALOG_URL}catalog-version.json">catalog-version.json</a></p>
</footer>
<script>
(function () {
  var input = document.getElementById('q');
  var count = document.getElementById('count');
  var rows = [];
  var groups = [];
  var skillNodes = document.querySelectorAll('[data-skill]');
  var groupNodes = document.querySelectorAll('[data-group]');
  var total = skillNodes.length;
  var i;
  for (i = 0; i < skillNodes.length; i++) rows.push(skillNodes[i]);
  for (i = 0; i < groupNodes.length; i++) groups.push(groupNodes[i]);

  function apply() {
    var q = input.value.trim().toLowerCase();
    var shown = 0;
    var j;
    for (j = 0; j < rows.length; j++) {
      var hit = q === '' || rows[j].getAttribute('data-search').indexOf(q) !== -1;
      rows[j].hidden = !hit;
      if (hit) shown++;
    }
    for (j = 0; j < groups.length; j++) {
      var members = groups[j].querySelectorAll('[data-skill]');
      var has = false;
      for (var m = 0; m < members.length; m++) {
        if (!members[m].hidden) { has = true; break; }
      }
      groups[j].hidden = !has;
    }
    count.textContent = q === '' ? total + ' skills' : shown + ' of ' + total + ' match';
  }

  input.addEventListener('input', apply);
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== input && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      input.focus();
    } else if (e.key === 'Escape' && document.activeElement === input && input.value !== '') {
      input.value = '';
      apply();
    }
  });

  var copy = document.getElementById('copy');
  var snippet = document.getElementById('snippet');
  if (copy && snippet) {
    copy.addEventListener('click', function () {
      var text = snippet.textContent;
      function show(message) {
        copy.textContent = message;
        setTimeout(function () { copy.textContent = 'Copy'; }, 2000);
      }
      function selectFallback() {
        var range = document.createRange();
        range.selectNodeContents(snippet);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (error) { ok = false; }
        show(ok ? 'Copied' : 'Select and copy');
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () { show('Copied'); },
          function () { selectFallback(); }
        );
      } else {
        selectFallback();
      }
    });
  }
})();
</script>
</body>
</html>
`;
}

export function writeCatalogue({ root = ROOT, siteDir }) {
  const catalog = JSON.parse(readFileSync(join(root, "index.json"), "utf8"));
  const { version: catalogVersion } = JSON.parse(
    readFileSync(join(root, "catalog-version.json"), "utf8"),
  );

  const skills = (catalog.skills ?? [])
    .map((skill) => {
      const files = Array.isArray(skill.files) ? skill.files : [];
      const { entry, description } = readEntry(root, skill.name, files);
      return {
        name: skill.name,
        version: skill.version,
        description,
        sourceUrl: `${REPO_URL}/blob/main/skills/${skill.name}/${entry}`,
      };
    })
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

  if (skills.length === 0) fail("catalog lists no skills; refusing to write an empty page");

  const generated = new Date().toISOString().slice(0, 10);
  const html = renderCatalogue({ skills, catalogVersion, generated });
  const target = join(siteDir, "catalogue.html");
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html);
  return { path: target, count: skills.length, catalogVersion };
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const result = writeCatalogue({ siteDir: join(ROOT, "_site") });
  console.log(
    `wrote ${result.path} (${result.count} skills, catalog ${result.catalogVersion})`,
  );
}
