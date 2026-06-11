# WatchDocs

![version](https://img.shields.io/badge/version-0.3.4-blue)

> Auto-detect project dependencies across 7 ecosystems and open their official documentation — from sidebar, search, or inline hover.

WatchDocs is a VS Code extension that eliminates the friction of hunting down documentation. It scans your workspace for dependency manifest files, resolves every package to its official documentation URL, and gives you instant access through a sidebar, a fuzzy search, or an inline hover on import statements.

---

## Ecosystem Support

| Ecosystem | Manifest Files | Languages |
|-----------|---------------|-----------|
| npm | `package.json` | JavaScript, TypeScript, JSX, TSX |
| pip | `requirements.txt`, `pyproject.toml`, `uv.lock` | Python |
| go | `go.mod` | Go |
| cargo | `Cargo.toml` | Rust |
| maven | `pom.xml` | Java, Kotlin |
| pub | `pubspec.yaml` | Dart |
| bundler | `Gemfile` | Ruby |

---

## Quick Start

1. Install WatchDocs from the VS Code Marketplace
2. Open any project with dependencies (a `package.json`, `requirements.txt`, `go.mod`, etc.)
3. Click the WatchDocs icon in the Activity Bar and press "Scan Dependencies"
4. Results appear incrementally as they are resolved

---

## Features

### Dependency Scanning
WatchDocs automatically detects all manifest files in your workspace, including deeply nested monorepo directories. It skips `node_modules`, `dist`, `build`, and `.git` folders by default. When any manifest file is created, changed, or deleted, the sidebar refreshes automatically through a file system watcher — no manual re-scan needed.

### Documentation Resolution
Resolution follows a two-tier pipeline for speed and coverage:

1. **Local registry** — 280+ pre-mapped packages across 7 JSON files, resolved instantly with no network call. This covers popular packages like `react`, `express`, `django`, `flask`, `serde`, `spring-boot`, and more.
2. **Online registry** — If a package is not in the local registry, WatchDocs fetches it from the official registry (npmjs.org, PyPI, RubyGems.org, crates.io, Maven Central, pub.dev, or proxy.golang.org). A 16-concurrency worker pool resolves up to 16 packages in parallel with a 5000ms timeout per request.

Results are cached in a shared in-memory store. If manifest files have not changed since the last scan, the resolver is skipped entirely, reusing cached results for zero-wait refresh.

### Sidebar & Tree View
The WatchDocs sidebar in the Activity Bar shows resolved dependencies grouped by language ecosystem first, then by type within each language section:

- **Production** — runtime dependencies (`dependencies` in package.json, top-level gems, etc.)
- **Development** — dev tooling (`devDependencies`, linters, formatters)
- **Test** — testing frameworks and coverage tools

Each ecosystem section uses a language icon (like `json` for JavaScript, `library` for Python, `ruby` for Ruby).

Each entry shows the package name and version, with an icon to open the documentation in VS Code's built-in Simple Browser. External URLs fall back to your default browser automatically.

### Fuzzy Search
Press "Search Dependencies" in the sidebar or type a query to filter your dependency list in real time. The search uses `fuzzysort` with typo tolerance — partial matches and misspellings still return results. The QuickPick interface pre-warms on first use for instant response.

### Export to Markdown
Click "Export Dependencies" to save your entire dependency list as a `dependencies.md` file. Each entry is a clickable Markdown link ready for sharing with your team or adding to project documentation.

### Inline Hover Documentation
Hover over any import, require, or gem statement in your code to see a tooltip with the package name and a link to its official documentation. Click the link to open it immediately.

Supports 8 languages:

| Language | Statement Pattern |
|----------|------------------|
| JavaScript / TypeScript | `import ... from 'pkg'`, `require('pkg')` |
| Python | `import pkg`, `from pkg import ...` |
| Go | `import "pkg"` (single-line and grouped blocks) |
| Rust | `use pkg::...` |
| Java / Kotlin | `import com.package.Class` |
| Dart | `import 'package:pkg/...'` |
| Ruby | `require 'pkg'`, `gem 'pkg'` |

The hover resolution uses the same shared cache as the sidebar scan. Once you have scanned your project, hovering over any recognized import is instant — no network call needed.

---

## Commands

| Command | Description |
|---------|-------------|
| `watchdocs.scan` | Scan workspace for dependencies and resolve documentation URLs |
| `watchdocs.search` | Open fuzzy search QuickPick |
| `watchdocs.exportDependencies` | Export dependency list as a Markdown file |
| `watchdocs.clearSearch` | Clear the search filter and show all dependencies |
| `watchdocs.refreshTreeView` | Refresh the sidebar view |
| `watchdocs.helloWorld` | Show a hello message (for debugging) |

All commands are accessible via the Command Palette (`Ctrl+Shift+P`).

---

## How It Works

```
1. Scanner
   workspace.findFiles() discovers manifest files, excludes vendor/generated dirs

2. Parser
   Each manifest type has a dedicated parser that extracts package name,
   version, and classification (prod/dev/test)

3. Resolver
   + Local registry lookup (instant, 280+ pre-mapped)
   + Miss? 16-concurrency online fetch (npmjs, PyPI, crates.io, etc.)
     Each request has a 5000ms timeout
   + Results cached in shared doc-cache (in-memory)

4. UI
   + Sidebar: TreeView with language → Prod/Dev/Test sections, incremental updates
   + Search: fuzzysort with typo tolerance, pre-warmed QuickPick
   + Hover: Shared cache gives instant resolution for scanned packages
   + Export: Markdown file with clickable links

5. Caching
   Shared doc-cache populated by scan, consumed by hover. Mtime-based
   fingerprint detects file changes — no redundant network calls.
```

## Architecture

| Module | Purpose |
|--------|---------|
| `scanner.ts` | Workspace file discovery with glob patterns and exclusions |
| `parsers/` | 8 parser functions (one per manifest type) |
| `import-detector.ts` | Import statement regex detection for 8 languages |
| `dedup.ts` | Deduplicate deps by ecosystem:name across multiple manifests |
| `resolver.ts` | Two-tier orchestration, 16-worker pool, parallel ecosystems |
| `registry-resolver.ts` | Local JSON registry lookup with caching |
| `online-*.ts` | 7 online resolvers (npm, pip, go, cargo, maven, pub, bundler) |
| `doc-cache.ts` | Shared in-memory cache between scan and hover |
| `tree-provider.ts` | Sidebar TreeDataProvider with categorized sections |
| `hover-provider.ts` | Inline HoverProvider with import detection |
| `export-markdown.ts` | Markdown file export |
| `cache.ts` | Session-level registry file cache |

---

## Development

```bash
git clone https://github.com/csivitu/watchdocs
cd watchdocs
npm install
code .
# Press F5 to launch the Extension Development Host
```

Build scripts:

| Script | Purpose |
|--------|---------|
| `npm run compile` | Full build (type-check + lint + bundle) |
| `npm run watch` | Watch mode for development |
| `npm run package` | Production build (minified) |

---

## Testing

```bash
npm test
```

Tests use Mocha. Test files live in `src/test/`:
- `parsers.test.ts` — all 8 manifest parsers (package.json, requirements.txt, pyproject.toml, uv.lock, go.mod, Cargo.toml, pom.xml, pubspec.yaml, Gemfile)
- `resolvers.test.ts` — all 7 online resolvers with mocked fetch (npm, PyPI, Go, crates.io, Maven Central, pub.dev, RubyGems)
- `core.test.ts` — doc-cache and dependency deduplication
- `hover.test.ts` — import statement detection for 8 languages

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for the full version history.

---

## License

MIT
