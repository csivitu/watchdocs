# Changelog

All notable changes to the WatchDocs extension will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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