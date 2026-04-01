# WatchDocs

> Auto-detect project dependencies and jump directly to their official documentation

---

## Overview

WatchDocs is a VS Code extension that streamlines development by automatically scanning your workspace for dependency manifest files (`package.json`, `requirements.txt`, etc.), extracting the listed packages, and providing instant clickable links to their official documentation.

**Who it's for:**
- Developers working with multiple dependencies across different ecosystems
- Teams who frequently reference documentation during development
- Anyone who wants to reduce time spent searching for docs

**Problem it solves:**
- No more manually searching for documentation URLs
- Eliminates bookmarking and maintaining doc links
- Provides a centralized view of all project dependencies with direct access to their docs

---

## Preview

![WatchDocs Demo](resources/demo.webp)

*Sidebar showing detected dependencies with clickable documentation links*

---

## Features

- **Auto Dependency Detection** - Scans workspace for `package.json` and `requirements.txt`
- **Three-Tier Resolution Engine** - Local registry cache → Online NPM registry → AI fallback for maximum coverage
- **Multi-Ecosystem Support** - npm, pip (current) & Go, Cargo, Maven, Pub (future)
- **Interactive Sidebar** - View all dependencies in one place with one-click doc access
- **Secure API Key Storage** - Gemini API key stored in VS Code's encrypted secrets storage
- **Progressive UI Updates** - Results appear incrementally as they're resolved
- **Smart Caching** - 260+ packages in local registry (offline), with online NPM fallback for real-time resolution

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
5. **Click any dependency** to open its official documentation in your browser

### Setting Up API Key (Optional)

For packages not in the local registry, you can configure Gemini AI fallback:

1. Click the **key icon** in the sidebar ("Add Gemini API Key")
2. Enter your [Google Gemini API key](https://aistudio.google.com/app/apikey)
3. Press `Enter` to save securely

### Example

**Input:**
```
Workspace contains:
- /my-project/package.json (with react, next, express)
- /my-project/requirements.txt (with django, requests)
```

**Output:**
```
Sidebar displays:
├── Scan Dependencies ▶
├── react 18.2.0 → https://react.dev/
├── next 14.1.0 → https://nextjs.org/docs
├── express 4.18.0 → https://expressjs.com/
├── django 4.2.0 → https://docs.djangoproject.com/
├── requests 2.31.0 → https://requests.readthedocs.io/
└── Gemini API Key Exist ✓
```

---

## Commands

| Command | Description |
|---------|-------------|
| `watchdocs.scan` | Scan workspace for dependencies and resolve documentation URLs |
| `watchdocs.setApiKey` | Prompt to enter and securely store Gemini API key |
| `watchdocs.clearApiKey` | Remove stored Gemini API key |
| `watchdocs.refreshTreeView` | Refresh the dependency tree view |
| `watchdocs.helloWorld` | Show "Hello from WatchDocs!" message (debug) |

Access commands via Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)

---

## Configuration

WatchDocs does not currently expose user-configurable settings. All configuration is managed through commands.

### API Key Management

API key is stored in VS Code's secure secrets storage (encrypted):

| Setting | Description | Default |
|---------|-------------|---------|
| `gemini-api-key` | Google Gemini API key for AI-based doc resolution | Not set (optional) |

**Example: Setting via Command**
```json
// Run: watchdocs.setApiKey
// Enter your key in the input box
```

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

### Overview

WatchDocs uses a **three-tier hybrid resolution strategy**:
1. **Local Registry Cache** (fastest, offline-capable) - Checks pre-populated JSON registries (260+ packages)
2. **Online NPM Registry** (fast, requires internet) - Fetches homepage URLs directly from npmjs.org for npm packages
3. **Gemini AI Fallback** (comprehensive, requires API key) - Queries AI for packages not found in previous tiers

This approach ensures fast resolution for popular packages while maintaining coverage for niche dependencies.

### Execution Flow

1. **Trigger** - User clicks "Scan Dependencies" button in sidebar
2. **File Discovery** - Scanner searches workspace for manifest files (`package.json`, `requirements.txt`)
3. **File Reading** - Reader loads each manifest file using VS Code's virtual file system, by getting utf-8 then converting to string
4. **Parsing** - Ecosystem-specific parsers extract dependency names and versions from string of each file
5. **Resolution** - Main resolver orchestrates three-tier lookup:
   - Tier 1: Local registry cache (instant)
   - Tier 2: Online NPM registry fetch (npm packages only)
   - Tier 3: Gemini AI fallback (remaining packages)
6. **Display** - Results rendered incrementally in sidebar tree view, with registry lookup at instant

### Core Components

| Component | Responsibility |
|-----------|----------------|
| `DocsTreeProvider` | Manages sidebar tree state and user interactions |
| `scanWorkspace()` | Finds all manifest files with include/exclude patterns |
| `readFile()` | Reads file content from VS Code's virtual file system |
| `parsePackageJson()` | Extracts npm dependencies from `package.json` |
| `parseRequirementsTxt()` | Extracts pip dependencies from `requirements.txt` |
| `resolver()` | Orchestrates three-tier resolution strategy with progress callbacks |
| `registryResolver()` | Looks up docs from local JSON registries |
| `onlineNpmResolver()` | Fetches documentation URLs from npm registry in real-time |
| `geminiResolver()` | Falls back to Gemini AI for unknown packages |
| `cache` | In-memory caching for registry data |

### Data Flow

```
User Action (Click Scan)
    ↓
DocsTreeProvider.scan()
    ↓
scanWorkspace() → [package.json, requirements.txt]
    ↓
readFile() → file contents
    ↓
parsePackageJson() / parseRequirementsTxt() → Dependency[]
    ↓
resolver()
    ├─→ registryResolver() → DocResult[] (found)
    ├─→ onlineNpmResolver() → DocResult[] (npm packages)
    └─→ geminiResolver() → DocResult[] (remaining)
    ↓
Sidebar Tree View (clickable links)
```

### Walkthrough

**Scenario:** User has a React + Express + Axios project

1. User clicks **Scan Dependencies** in sidebar
2. Extension searches workspace, finds `/src/package.json`
3. Reads file content: `{"dependencies": {"react": "^18.2.0", "express": "^4.18.0", "axios": "^1.6.0"}}`
4. Parses to: `[{name: "react", version: "18.2.0", ecosystem: "npm"}, ...]`
5. Calls `resolver()` with progress callback
6. **Tier 1 - Registry lookup:**
   - Loads `npm.json` from resources (cached in memory)
   - Finds "react" → `https://react.dev/`
   - Finds "express" → `https://expressjs.com/`
   - Package "axios" not found in local cache
7. **Tier 2 - Online NPM lookup:** (for missing npm packages)
   - Fetches `https://registry.npmjs.org/axios/latest`
   - Extracts `homepage` field from response
   - Returns `https://axios-http.com/`
8. Progress callback updates UI with all found results
9. No missing packages, so Gemini AI not invoked
10. Sidebar displays all dependencies with external link icons
11. User clicks "react" → browser opens `https://react.dev/`

---

## Architecture

### Project Structure

```
watchdocs/
├── src/
│   ├── extension.ts           # Entry point, command registration
│   ├── models.ts              # TypeScript interfaces and types
│   ├── test-resolver.ts       # Standalone resolver test (Node.js)
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
│   │   │   └── parse-requirements.ts      # pip parser
│   │   ├── resolver/
│   │   │   ├── resolver.ts    # Main orchestrator
│   │   │   ├── registry-resolver.ts       # Local registry lookup
│   │   │   └── gemini-resolver.ts         # AI fallback resolver
│   │   └── cache/
│   │       └── cache.ts       # In-memory registry cache
│   └── test/
│       ├── extension.test.ts  # Extension test suite
│       ├── parser.test.ts     # Parser unit tests
│       └── run-parser.ts      # Manual parser test script
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
| `resolver.ts` | Three-tier resolution orchestration with progress callbacks |
| `registry-resolver.ts` | Fast local JSON registry lookup with caching |
| `online-npm-resolver.ts` | Real-time npm registry fetcher for homepage URLs |
| `gemini-resolver.ts` | AI-based resolution using Google Gemini API |
| `cache.ts` | Session-based in-memory registry caching |

---

## Known Issues

- **Go Module Parsing Not Implemented** - `go.mod` files are detected but not parsed (registry infrastructure exists)
- **Limited Pip Format Support** - Only handles `package==version` format; does not support `>=`, `<=`, `~=`, or extras
- **No DevDependency Distinction** - npm `devDependencies` shown alongside `dependencies` without visual distinction
- **Single Workspace Limitation** - Only scans first workspace folder in multi-root workspaces
- **Online Resolver Limitations** - NPM online resolver only fetches `homepage` field; packages without homepage return null and proceed to AI fallback
- **AI Response Parsing** - Gemini AI may occasionally return malformed JSON, causing fallback to "unknown"

Report issues on the [GitHub repository](#).

---

## Roadmap

### v0.2.0 (In Development)
- [x] Implemented online NPM resolver for real-time registry fetches
- [x] Three-tier resolution strategy (local → online → AI)
- [x] Improved coverage for npm packages not in local registry
- [ ] Implement `go.mod` parser
- [ ] Add support for `Cargo.toml` (Rust)
- [ ] Add support for `pom.xml` (Maven)
- [ ] Add support for `pubspec.yaml` (Dart/Flutter)
- [ ] Visual distinction between dependencies and devDependencies
- [ ] Automatic rescanning on manifest file changes

### v0.3.0 (Planned)
- [ ] Version-specific documentation links
- [ ] Offline mode toggle (disable AI calls)
- [ ] Custom registry JSON support (user-provided)
- [ ] Documentation preview panel (embedded docs)
- [ ] Search/filter dependencies in sidebar

### Future Considerations
- [ ] Multi-root workspace support
- [ ] Dependency update notifications
- [ ] Security vulnerability alerts
- [ ] Documentation search within sidebar
- [ ] Export dependency list (Markdown, JSON)

---

## Release Notes

### 0.2.0-alpha (In Development)
- Implemented online NPM resolver for real-time registry fetches
- Three-tier resolution strategy (local → online → AI)
- Improved coverage for npm packages not in local registry
- Updated documentation with new resolution flow

### 0.1.0-alpha (2026-03-30)
- **Initial alpha release**
- Core dependency scanning for npm and pip ecosystems
- Hybrid resolution engine (registry + Gemini AI)
- Interactive sidebar with clickable documentation links
- Secure API key storage using VS Code secrets
- Pre-populated registry with 260+ popular packages
- Progress reporting with incremental UI updates
- Parser unit tests and standalone test scripts

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

### Test Standalone Resolver

```bash
# Set environment variable
export GEMINI_API_KEY="your-api-key"

# Run standalone test (outside VS Code)
npx ts-node src/test-resolver.ts
```

---

## Testing

### Run Tests

```bash
# Compile tests and run
npm test
```

### Test Coverage

Tests located in `src/test/`:
- `extension.test.ts` - Extension activation and command tests
- `parser.test.ts` - Parser unit tests (npm, pip)
- `run-parser.ts` - Manual parser test script

### Write New Tests

1. Create test file matching pattern `*.test.ts`
2. Use Mocha assertion library (`assert.strictEqual`, etc.)
3. Run tests via Testing view in VS Code or `npm test`

---

## Contributing

Contributions are welcome! Here's how to help:

### Ways to Contribute
- **Add Registry Entries** - Submit PRs adding popular packages to `resources/registries/*.json`
- **New Parsers** - Implement parsers for additional manifest formats (Cargo.toml, pom.xml, etc.)
- **Bug Fixes** - Report and fix issues via GitHub
- **Feature Requests** - Open issues with detailed use cases
- **Documentation** - Improve README, add examples, fix typos

### Development Guidelines
1. Follow existing code style (2-space indentation, TypeScript strict mode)
2. Add tests for new functionality
3. Update README for user-facing changes
4. Use meaningful commit messages

### Submitting a PR
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/add-cargo-parser`)
3. Make changes and test locally
4. Commit with clear messages
5. Open pull request with description

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgements

- **[Google Gemini AI](https://ai.google.dev/)** - Powers the AI fallback resolver for unknown packages
- **[Keep a Changelog](https://keepachangelog.com/)** - Changelog format inspiration
- **[VS Code Extension API](https://code.visualstudio.com/api)** - Extension framework and documentation
- **Package Maintainers** - All the open-source projects whose documentation is linked

---

## Support

- **Documentation:** This README
- **Issues:** [GitHub Issues](#)
- **API Key:** Get your free Gemini API key at [Google AI Studio](https://aistudio.google.com/app/apikey)

---

**Made with ❤️ for developers by developers@CSI**
