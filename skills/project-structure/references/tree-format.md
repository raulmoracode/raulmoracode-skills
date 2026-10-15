# Tree format and enumeration

Mechanics for `project-structure`: how to find the root, enumerate without walking
vendored noise, which names to exclude, and how to render and truncate the tree. Read it
before you enumerate a repository you have not mapped before.

## Finding the root

Take the nearest ancestor that is a project rather than a folder:

- A `.git` directory or file (a file means a worktree or submodule).
- A manifest: `package.json`, `pyproject.toml`, `setup.py`, `go.mod`, `Cargo.toml`,
  `pom.xml`, `build.gradle`, `*.csproj`, `*.sln`, `Gemfile`, `composer.json`.
- Workspace markers: `pnpm-workspace.yaml`, `lerna.json`, `nx.json`, `turbo.json`,
  `Cargo.toml` with `[workspace]`, `go.work`, `.gitmodules`.
- Project instructions: `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`.

More than one root means the repository holds several projects. Name them all in one
line, pick the one the request implies, and say which you chose. If the request is
ambiguous about which project it means and the answer changes the output materially,
ask once.

## Enumerating

Prefer what the project says about itself over a raw filesystem walk, because
`.gitignore` is the project's own statement of what is noise.

```sh
git ls-files                      # tracked files, .gitignore already applied
git ls-files --others --exclude-standard   # untracked files that are not ignored
find . -maxdepth 2 -type d -not -path './.git*'   # directory shape only
```

Read-only rules for whatever you run: nothing that writes, moves a ref, installs, or
formats. On a repository with no Git, a depth-limited `find` or the editor's file list is
enough. Do not recurse a directory you have already decided to exclude.

## Default exclusions

Exclude these **when they are generated or third-party**, which is the usual case:

- Version control and editor state: `.git/`, `.svn/`, `.hg/`, `.idea/`, `.vscode/`.
- Dependencies and vendored code: `node_modules/`, `vendor/`, `third_party/`, `deps/`,
  `.venv/`, `venv/`, `env/`, `__pycache__/`, `.tox/`, `.bundle/`.
- Build output and caches: `dist/`, `build/`, `out/`, `target/`, `coverage/`,
  `.next/`, `.nuxt/`, `.svelte-kit/`, `.turbo/`, `.parcel-cache/`, `.cache/`,
  `.gradle/`, `.mypy_cache/`, `.pytest_cache/`, `.ruff_cache/`, `*.egg-info/`.
- Large generated data: `*.min.js`, source maps, lockfile-adjacent dumps, model or
  dataset directories, `*.log`.

The list is a default, not a rule. Do not exclude a name because it is on it — exclude
it because it is generated here. `build/` holds source in enough projects (older C/C++,
Make-based JavaScript, some Java layouts) that you confirm before dropping it. When a
name is ambiguous, look at one entry inside it or at the tool that writes it.

Excluding something the reader needs is worse than including noise. If the request names
the directory, it is not excluded.

## Hidden files

Dotfiles are not noise by default. Include the ones that explain the project:

- `.gitignore` — what the project considers disposable, which is your exclusion policy.
- `.editorconfig`, `.prettierrc*`, `.eslintrc*`, `biome.json`, `.stylelintrc*` — style.
- `.nvmrc`, `.python-version`, `.tool-versions`, `rust-toolchain*` — pinned runtime.
- `.npmrc`, `.yarnrc*`, `pip.conf` — registry and install configuration.
- `.env.example`, `.env.sample`, `.env.template` — required variables, names only.
- `.dockerignore`, `Dockerfile*`, `docker-compose*` — how it ships.
- `.github/`, `.gitlab-ci.yml`, `.circleci/` — what gates a merge.

Leave out secrets themselves (`*.pem`, `*.key`, `id_rsa*`, `credentials.json`,
`.env`, `.netrc`) beyond naming them.

## Rendering

- `├──` for an entry that has a sibling below it.
- `└──` for the last entry in its directory.
- `│` (plus the matching spaces) to continue every open ancestor branch.
- A trailing `/` on directories, never on files.
- `#` then the description, in the same line, after the name.
- Keep the tree in one fenced block so alignment survives.

Align the `#` column when the longest name allows it without running descriptions far
past the right edge. Consistency matters more than a perfect column: one extra space
never hurts, a tree that wraps does.

Names are shown as they exist, including their case and extension. Do not normalize or
abbreviate a name to make the tree prettier.

## Truncation and depth

- `...` means content exists below and is intentionally not shown. It never means the
  directory is empty, and it is never used under an empty directory.
- Put the reason in the description when it is not obvious: `# Additional nested
  contents omitted.` or `# 24 generated route modules; listing omitted.`
- Collapse a run of same-purpose siblings into one line with a count rather than listing
  a hundred near-identical entries.
- Depth 2–3 is the useful default for orientation. Deeper only on request or on a
  directory the user named.
- If the whole tree exceeds what one response can carry, show the top levels and say
  plainly what remains, then offer to expand a specific branch. Do not silently stop.
