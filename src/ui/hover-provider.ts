import * as vscode from "vscode";
import { regisrtyResolver } from "../core/resolver/registry-resolver";

type Ecosystem = "npm" | "pip" | "go" | "cargo" | "maven" | "pub";

function detectImport(
    line: string,
    languageId: string
): { name: string; ecosystem: Ecosystem } | null {

    switch (languageId) {

        // JavaScript / TypeScript
        case "javascript":
        case "typescript":
        case "javascriptreact":
        case "typescriptreact": {

            const importFrom = line.match(
                /^\s*import\s+.+?\s+from\s+['"](@?[^'"./][^'"]*)['"]/
            );

            const sideEffect = line.match(
                /^\s*import\s+['"](@?[^'"./][^'"]*)['"]/
            );

            const requireImport = line.match(
                /require\s*\(\s*['"](@?[^'"./][^'"]*)['"]\s*\)/
            );

            const pkg =
                importFrom?.[1] ||
                sideEffect?.[1] ||
                requireImport?.[1];

            return pkg
                ? { name: pkg, ecosystem: "npm" }
                : null;
        }

       
        // Python
        case "python": {

            const importMatch = line.match(
                /^\s*import\s+([a-zA-Z0-9_]+)/ 
            );

            const fromMatch = line.match(
                /^\s*from\s+([a-zA-Z0-9_]+)\s+import\s+/
            );

            const pkg =
                importMatch?.[1] ||
                fromMatch?.[1];

            return pkg
                ? { name: pkg, ecosystem: "pip" }
                : null;
        }

        // Go
        case "go": {

            const match = line.match(
                /^\s*import\s+(?:\w+\s+)?["']([^"']+)["']/
            );

            return match
                ? { name: match[1], ecosystem: "go" }
                : null;
        }

        // Rust
        case "rust": {

            const match = line.match(
                /^\s*use\s+([a-zA-Z0-9_]+)/
            );

            return match
                ? { name: match[1], ecosystem: "cargo" }
                : null;
        }

        // Java / Kotlin
        case "java":
        case "kotlin": {

            const match = line.match(
                /^\s*import\s+([a-zA-Z0-9_.]+)/
            );

            return match
                ? { name: match[1], ecosystem: "maven" }
                : null;
        }

        // Dart
        case "dart": {

            const match = line.match(
                /^\s*import\s+['"]package:([a-zA-Z0-9_]+)/
            );

            return match
                ? { name: match[1], ecosystem: "pub" }
                : null;
        }

        default:
            return null;
    }
}

export class DocsHoverProvider implements vscode.HoverProvider {

    async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Hover | null> {

        const line = document.lineAt(position).text;

        // Ignore comments quickly
        const trimmed = line.trim();

        if (
            trimmed.startsWith("//") ||
            trimmed.startsWith("#") ||
            trimmed.startsWith("*") ||
            trimmed.startsWith("/*") ||
            trimmed.startsWith("--")
        ) {
            return null;
        }

        // Detect valid imports
        const detected = detectImport(line, document.languageId);

        if (!detected) {
            return null;
        }

        // Ensure cursor is actually hovering package text
        const wordRange = document.getWordRangeAtPosition(
            position,
            /[@a-zA-Z0-9_./-]+/
        );

        if (!wordRange) {
            return null;
        }

        const hoveredText = document.getText(wordRange);

        if (!detected.name.includes(hoveredText)) {
            return null;
        }

        const result = await regisrtyResolver({
            name: detected.name,
            version: null,
            ecosystem: detected.ecosystem
        });

        if (!result?.docUrl) {
            return null;
        }

        const markdown = new vscode.MarkdownString();

        markdown.isTrusted = true;

        markdown.appendMarkdown(`## 📦 ${detected.name}\n\n`);
        markdown.appendMarkdown(
            `[📖 Open Docs](command:watchdocs.openDoc?${encodeURIComponent(
                JSON.stringify([result.docUrl])
            )})`
        );

        return new vscode.Hover(markdown);
    }
}