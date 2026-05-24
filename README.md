# WatchDocs

> Auto-detect project dependencies and jump directly to their official documentation

---

## Overview

WatchDocs is a VS Code extension that streamlines development by automatically scanning your workspace for dependency manifest files, extracting packages, and providing instant clickable links to their official documentation.

**Features:**
- **Auto Dependency Detection** - Scans for `package.json`, `Cargo.toml`, `go.mod`, `requirements.txt`, `pyproject.toml`, `pom.xml`, `pubspec.yaml`
- **Two-Tier Resolution** - Local registry cache (277+ packages) → Online registries for maximum coverage
- **High-Performance** - 16-concurrency worker pool with incremental UI updates (batches of 4)
- **Multi-Ecosystem** - npm, pip, go, cargo, maven, pub
- **Interactive Sidebar** - View all dependencies with one-click doc access
- **Fuzzy Search** - Real-time dependency search with typo tolerance via QuickPick UI

**Who it's for:** Developers working with multiple dependencies, teams referencing docs frequently, anyone reducing time spent searching for documentation.

---

## Preview

![WatchDocs Demo](resources/demo.webp)

*Sidebar showing detected dependencies with clickable documentation links*

---

## Features

- **Auto Dependency Detection** - Scans workspace for manifest files (`package.json`, `requirements.txt`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`, `pubspec.yaml`)
- **Two-Tier Resolution Engine** - Local registry cache → Online registries for maximum coverage
- **High-Performance Worker Pool** - 16-concurrency worker pool for rapid dependency resolution
- **Multi-Ecosystem Support** - npm, pip, go, cargo, maven, pub
- **Interactive Sidebar** - View all dependencies in one place with one-click doc access
- **Fuzzy Search** - QuickPick search with instant filtering, typo tolerance, and clear search action
- **Progressive UI Updates** - Results appear incrementally in batches of 4 as they're resolved
- **Smart Caching** - 277+ packages in local registry (offline), with online fallback for real-time resolution

---

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac) to open Extensions view
3. Search for "WatchDocs"
4. Click **Install**
5. The WatchDocs icon will appear in the Activity Bar

### From CLI

```bash
code --install-extension watchdocs.watchdocs
```

---

## Usage

### Basic Usage

1. **Open your project** in VS Code
2. **Click the WatchDocs icon** in the Activity Bar (left sidebar)
3. **Click "Scan Dependencies"** (play button) in the sidebar
4. **Wait for resolution** - dependencies will appear as they're found
5. **Click any dependency** to open its official documentation in VS Code's embedded browser

### Search Dependencies

1. **Click "Search Dependencies"** in sidebar or run `Search Dependencies` from Command Palette
2. **Type to filter** - results appear instantly with fuzzy matching and typo tolerance
3. **Click any result** to open its docs
4. **Click "Clear search"** or press Escape to reset

### Example

Workspace with `package.json` (react, next, express) and `requirements.txt` (django, requests):

```
Sidebar displays:
├── react 18.2.0 → https://react.dev/
├── next 14.1.0 → https://nextjs.org/docs
├── django 4.2.0 → https://docs.djangoproject.com/
└── requests 2.31.0 → https://requests.readthedocs.io/
```

---

## Commands

| Command | Description |
|---------|-------------|
| `watchdocs.scan` | Scan workspace for dependencies and resolve documentation URLs |
| `watchdocs.search` | Open fuzzy search QuickPick for dependencies |
| `watchdocs.refreshTreeView` | Refresh the dependency tree view |
| `watchdocs.helloWorld` | Show "Hello from WatchDocs!" message (debug) |

Access commands via Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)

---

## Keybindings

No default keyboard shortcuts. You can add custom keybindings in `keybindings.json`:

```json
[
  {
    "key": "ctrl+shift+d",
    "command": "watchdocs.scan",
    "when": "editorTextFocus"
  }
]
```

---

## How It Works

WatchDocs uses a **two-tier hybrid resolution strategy**:
1. **Local Registry Cache** (fastest, offline-capable) - Pre-populated JSON registries (277+ packages across 6 ecosystems)
2. **Online Registries** (fast, requires internet) - Fetches from npmjs.org, PyPI, pkg.go.dev, crates.io, Maven Central, and pub.dev using 16-concurrency worker pool

**Execution Flow:** User clicks "Scan Dependencies" → Scanner finds manifest files → Parsers extract dependencies → Resolver looks up docs (local cache → online) → Results displayed incrementally in sidebar.

---

## Architecture

### Project Structure

```
watchdocs/
├── src/
│   ├── extension.ts           # Entry point, command registration
│   ├── models.ts              # TypeScript interfaces and types
│   ├── ui/
│   │   └── tree-provider.ts   # Sidebar TreeDataProvider implementation
│   ├── core/
│   │   ├── scanner/
│   │   │   └── scanner.ts     # Workspace file discovery
│   │   ├── reader/
│   │   │   └── reader.ts      # File content reader
│   │   ├── parsers/
│   │   │   ├── index.ts       # Parser exports
│   │   │   ├── parse-package-json.ts      # npm parser
│   │   │   ├── parse-requirements.ts      # pip parser
│   │   │   ├── parse-pyproject-toml.ts    # pip parser (pyproject.toml)
│   │   │   ├── parse-go-mod.ts            # go parser
│   │   │   ├── parse-cargo-toml.ts        # cargo parser
│   │   │   ├── parse-pom-xml.ts           # maven parser
│   │   │   └── parse-pubspec-yaml.ts      # pub parser
│   │   ├── resolver/
│   │   │   ├── resolver.ts    # Main orchestrator (two-tier)
│   │   │   ├── registry-resolver.ts       # Local registry lookup
│   │   │   ├── online-npm-resolver.ts     # NPM online resolver
│   │   │   ├── online-pip-resolver.ts     # PyPI online resolver
│   │   │   ├── online-go-resolver.ts      # Go online resolver
│   │   │   ├── online-cargo-resolver.ts   # crates.io online resolver
│   │   │   ├── online-maven-resolver.ts   # Maven online resolver
│   │   │   └── online-pub-resolver.ts     # pub.dev online resolver
│   │   └── cache/
│   │       └── cache.ts       # In-memory registry cache
│   └── test/
│       ├── extension.test.ts  # Extension test suite
│       ├── parser.test.ts     # Parser unit tests
│       └── pip-resolver.test.ts # Pip resolver unit tests
├── resources/
│   ├── watchdocs-v2.svg       # Extension icon
│   └── registries/
│       ├── npm.json           # 85+ npm package URLs
│       ├── pip.json           # 70+ pip package URLs
│       ├── go.json            # 18 Go package URLs
│       ├── cargo.json         # 65+ Rust crate URLs
│       ├── maven.json         # 3 Java library URLs
│       └── pub.json           # 17 Dart/Flutter package URLs
├── dist/                      # Bundled extension output (git-ignored)
├── out/                       # Test build output (git-ignored)
├── package.json               # Extension manifest
├── tsconfig.json              # TypeScript configuration
└── esbuild.js                 # Build bundler configuration
```

### Module Responsibilities

| Module | Responsibility |
|--------|----------------|
| `extension.ts` | Activation, command registration, lifecycle management |
| `models.ts` | Type definitions (`Dependency`, `DocResult`, `DocResolver`, `ManifestFile`) |
| `tree-provider.ts` | Sidebar UI, scan orchestration, tree item rendering |
| `scanner.ts` | File discovery with glob patterns and exclusions |
| `reader.ts` | UTF-8 file reading via VS Code FS API |
| `parsers/` | Ecosystem-specific dependency extraction |
| `resolver.ts` | Two-tier resolution orchestration with progress callbacks |
| `registry-resolver.ts` | Fast local JSON registry lookup with caching |
| `online-*-resolver.ts` | Real-time registry fetchers for npm, pip, go, cargo, maven, pub |
| `cache.ts` | Session-based in-memory registry caching |

---

Report issues on the [GitHub repository](#).

---

## Roadmap

### v0.3.1 (Planned)
- [ ] Visual distinction between dependencies and devDependencies
- [ ] Automatic rescanning on manifest file changes
- [ ] Version-specific documentation links
- [ ] Documentation preview panel (embedded docs)

---

## Release Notes

### 0.3.1-alpha (2026-05-24)
- **Fuzzy Search**: Real-time dependency search with QuickPick UI
- **Embedded Browser**: Docs open in VS Code's simple browser with external fallback
- **Search UX**: Clear search action, pre-warmed search for instant response

### 0.3.0-alpha (2026-05-24)
- Added Rust (`Cargo.toml`), Maven (`pom.xml`), and Dart/Flutter (`pubspec.yaml`) support
- Removed Gemini AI requirement - works instantly with zero configuration
- Simplified to two-tier resolution: local registry → online

### 0.2.1-alpha (2026-05-05)
- 16-concurrency worker pool for faster dependency resolution
- Go (`go.mod`) and full Pip (`requirements.txt`, `pyproject.toml`) support
- Incremental UI updates in batches of 4

### 0.2.0-alpha (2026-04-01)
- Online NPM resolver for packages not in local cache
- Three-tier resolution: local → online → AI fallback

### 0.1.0-alpha (2026-03-29)
- Initial release with npm and pip dependency scanning
- Hybrid resolution (local registry + Gemini AI)
- Interactive sidebar with clickable documentation links

See [CHANGELOG.md](CHANGELOG.md) for full details.

---

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- VS Code 1.90.0 or later
- [Extension Development Host](https://code.visualstudio.com/api/get-started/your-first-extension) (recommended)

### Clone and Install

```bash
git clone <repo-url>
cd watchdocs
npm install
```

### Build

```bash
# Development build with sourcemaps
npm run compile

# Watch mode (auto-rebuild on changes)
npm run watch

# Production build (minified)
npm run package
```

### Debug

1. Press `F5` to launch Extension Development Host
2. A new VS Code window opens with the extension loaded
3. Set breakpoints in `src/` files for debugging

---

## Testing

```bash
npm test
```

Tests in `src/test/`: `extension.test.ts`, `parser.test.ts`, `pip-resolver.test.ts`. Create new tests matching `*.test.ts` pattern using Mocha assertions.

---

## Contributing

Contributions welcome! Here's how to help:

- **Add Registry Entries** - Submit PRs adding packages to `resources/registries/*.json`
- **New Parsers** - Implement parsers for additional manifest formats
- **Bug Fixes & Features** - Report/fix issues via GitHub
- **Documentation** - Improve README, add examples, fix typos

**Guidelines:** Follow existing code style (2-space indentation, TypeScript strict mode), add tests for new functionality, use meaningful commit messages.

**Submitting a PR:** Fork → Create feature branch (`git checkout -b feature/add-parser`) → Make changes & test → Commit → Open PR with description.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgements

- **[Keep a Changelog](https://keepachangelog.com/)** - Changelog format inspiration
- **[VS Code Extension API](https://code.visualstudio.com/api)** - Extension framework and documentation
- **Package Maintainers** - All the open-source projects whose documentation is linked

---

## Support

- **Documentation:** This README
- **Issues:** [GitHub Issues](#)

---

**Made with ❤️ for developers by developers@CSI**
