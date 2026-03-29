# Changelog

All notable changes to the WatchDocs extension will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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