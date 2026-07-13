# Contributing to WatchDocs

First off, thank you for considering contributing to WatchDocs! It's people like you who make open-source software a better place for everyone.

Below is a set of guidelines and instructions to help you contribute to the project.

---

## Table of Contents
1. [How Can I Contribute?](#how-can-i-contribute)
2. [Development Setup](#development-setup)
3. [Project Structure](#project-structure)
4. [Testing Guidelines](#testing-guidelines)
5. [Style Guide & Coding Standards](#style-guide--coding-standards)
6. [Submitting a Pull Request](#submitting-a-pull-request)

---

## How Can I Contribute?

### Add Registry Entries
You can help expand local registry support by adding popular package mappings to the JSON files under the `resources/registries/` directory (e.g., `npm.json`, `pip.json`, `go.json`, `cargo.json`, `maven.json`, `pub.json`, `nuget.json`).

### Implement New Parsers or Resolvers
Support new programming languages or build systems by adding:
- A dependency manifest parser in `src/core/parsers/`
- An online resolver (if needed) in `src/core/resolver/`
- Import detection regex in `src/core/import-detector.ts`

### Report Bugs and Suggest Features
Please open an issue on GitHub detailing the problem or feature request. Provide reproducible steps, sample code, and configuration details where possible.

---

## Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ and `npm`
- [VS Code](https://code.visualstudio.com/) 1.90.0 or later

### Installation
1. Fork and clone the repository:
   ```bash
   git clone https://github.com/<your-username>/watchdocs.git
   cd watchdocs
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Open the project in VS Code:
   ```bash
   code .
   ```

### Debugging the Extension
1. Open the project in VS Code.
2. Press `F5` (or go to the Run and Debug view and select **Run Extension**).
3. A new **Extension Development Host** window will open with WatchDocs active.
4. Set breakpoints in TypeScript source files to debug.

---

## Project Structure

- `src/` - TypeScript source code
  - `core/` - Business logic, parsers, and resolvers
  - `ui/` - VS Code integration (Hover Providers, Tree Views)
  - `test/` - Mocha test suite
- `resources/` - Icons and local JSON package registries
- `package.json` - VS Code Extension manifest

---

## Testing Guidelines

We use Mocha for unit testing.

### Running Tests
To run the full test suite, run:
```bash
npm test
```

### Adding Tests
- Unit tests for new parsers should be added to `src/test/parsers.test.ts`.
- Resolver tests should be added to `src/test/resolvers.test.ts`.
- Hover/regex detection tests should be added to `src/test/hover.test.ts`.
- Mock network calls where necessary so tests run fast and offline.

---

## Style Guide & Coding Standards

- **Formatting**: We use 4-space indentation. Maintain consistency with the existing codebase formatting.
- **TypeScript**:
  - Keep types strict. Avoid using `any` where possible.
  - Follow the standard TypeScript compiler options defined in `tsconfig.json`.
- **Commits**: Write clear, imperative commit messages (e.g., `feat: add support for X`, `fix: handle edge case in parser Y`).

---

## Submitting a Pull Request

1. Create a branch for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes and write tests.
3. Ensure all tests pass:
   ```bash
   npm test
   ```
4. Push your branch to GitHub and open a Pull Request against the `dev` branch.
5. Provide a clear explanation of the changes in the PR description.
