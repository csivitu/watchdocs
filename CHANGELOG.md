# Changelog

All notable changes to the WatchDocs extension will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.5] - 2026-06-12

### Changed
- **Structured export**: markdown export groups deps by ecosystem and type with branded filename

### Fixed
- **Cargo**: support all dependency section variants + inline table syntax + renamed packages + correct API response fields
- **npm**: fall back to repository URL when homepage is missing
- **pip**: strip extras syntax from names + support PEP 735 [dependency-groups]
- **Dart**: skip Flutter SDK dependencies

---

## [0.3.4] - 2026-06-11

### Added
- **UV lockfile**: `uv.lock` manifest support for Python ecosystem
- **Language grouping**: tree view groups deps by language (JavaScript, Python, Go, etc.) with codicons
- **Unit test suite**: 71 tests covering parsers, resolvers, doc-cache, dedup, and import detection

### Changed
- **Parallel resolution**: all 7 online ecosystem resolvers run simultaneously instead of sequentially
- **Simpler testing**: replaced VS Code test host with mocha; `npm test` runs in <1s, no download needed
- **Lower requirement**: VS Code engine floor dropped to 1.56 (from 1.120)
- **Warm start**: registries preloaded on activation for instant first scan

### Fixed
- **Duplicate deps**: no more repeated entries when multiple manifests share same ecosystem (e.g. pyproject + uv.lock)
- **Console noise**: removed stray error logging from Go, Pub, and Bundler resolver catch blocks

### Removed
- Unused `dotenv` and `ts-node` dependencies

---

## [0.3.3] - 2026-05-31

### Added
- **Shared doc cache**: hover instantly resolves from scan results
- **Skip-rescan**: no redundant network calls when manifests unchanged

### Changed
- **Consistent timeouts**: all 7 ecosystem resolvers use 5000ms fetch timeout

---

## [0.3.2-alpha] - 2026-05-30

### Added
- **Bundler/Gemfile**: full ecosystem support (parser, resolver, registry)
- **Inline hover**: instant doc links on hover over imports in 8 languages
- **Export Markdown**: save dependency list as clickable `.md` file
- **Auto-rescan**: sidebar refreshes on manifest file changes
- **Prod/Dev/Test**: dependencies categorized into sections in tree view

---

## [0.3.1-alpha] - 2026-05-24

### Added
- **Fuzzy Search**: Real-time dependency search with QuickPick UI and clear search action
- **Embedded Browser**: Docs open in VS Code's simple browser with external fallback

### Changed
- **Search Performance**: Pre-warmed fuzzysort and cached QuickPick for instant search response

---

## [0.3.0-alpha] - 2026-05-24

### Added
- **Rust Support**: Added full support for `Cargo.toml` files and online Rust dependency resolution.
- **Maven Support**: Added full support for `pom.xml` files and online Java dependency resolution.
- **Dart/Flutter Support**: Added full support for `pubspec.yaml` files and online Dart/Flutter dependency resolution.

### Changed
- **Simplified Resolution**: Removed Gemini AI fallback, now using two-tier local → online resolution.
- **Zero Configuration**: No API key required - extension works immediately after installation.

### Removed
- Gemini AI integration and API key management.
- `watchdocs.setApiKey` and `watchdocs.clearApiKey` commands.

---

## [0.2.1-alpha] - 2026-05-05

### Added
- **High-Performance Worker Pool**: Implemented a 16-concurrency worker pool for rapid dependency resolution.
- **Incremental UI Updates**: Dependency results now appear in batches of 4 for better UI responsiveness.
- **Go Support**: Added full support for `go.mod` files and online Go dependency resolution.
- **Pip Support**: Added full support for `requirements.txt` & `pyproject.toml` files and online pip dependency resolution.

---

## [0.2.0-alpha] - 2026-04-01

### Added
- **Online NPM Resolver**: Real-time registry fetch for npm packages not in local cache
- **Three-Tier Resolution**: Local registry → Online NPM → Gemini AI fallback
- **Improved Coverage**: Better documentation URL resolution for npm packages

### Changed
- Resolution flow now fetches from npmjs.org registry for missing packages before AI fallback

## [0.1.0-alpha] - 2026-03-29

### Added
- **Dependency Scanning**: Automatic detection of project dependencies from `package.json` (npm) and `requirements.txt` (pip)
- **Hybrid Documentation Resolution**: Two-tier approach combining local registry lookup + Gemini AI fallback
- **Registry Database**: Pre-populated docs for 80+ npm packages and 70+ pip packages
- **Multi-Ecosystem Support**: Registry infrastructure for npm, pip, cargo, go, maven and pub
- **VS Code Sidebar Integration**: "WatchDocs" view in Activity Bar with interactive dependency tree
- **Clickable Documentation Links**: Direct navigation to official docs from sidebar
- **Secure API Key Storage**: Gemini API key stored in VS Code's secure credential storage
- **Commands**:
  - `watchdocs.scan` - Scan workspace for dependencies
  - `watchdocs.setApiKey` - Configure Gemini API key
  - `watchdocs.clearApiKey` - Remove stored API key
  - `watchdocs.refreshTreeView` - Refresh dependency tree
- **Progress Reporting**: UI updates incrementally as dependencies are resolved
- **Test Infrastructure**: Parser tests and standalone resolver test script

### Technical Features
- Workspace file scanning with directory exclusion (`node_modules`, `dist`, `build`, `.git`)
- In-memory caching for resolved documentation URLs
- Graceful degradation when Gemini API is unavailable
- URL validation (HTTPS enforcement)