import * as vscode from "vscode";
import { registryResolver } from "../core/resolver/registry-resolver";
import { onlineNpmResolver } from "../core/resolver/online-npm-resolver";
import { onlinePipResolver } from "../core/resolver/online-pip-resolver";
import { onlineGoResolver } from "../core/resolver/online-go-resolver";
import { onlineCargoResolver } from "../core/resolver/online-cargo-resolver";
import { onlineMavenResolver } from "../core/resolver/online-maven-resolver";
import { onlinePubResolver } from "../core/resolver/online-pub-resolver";
import { onlineBundlerResolver } from "../core/resolver/online-bundler-resolver";
import { onlineNugetResolver } from "../core/resolver/online-nuget-resolver";
import { Dependency, DocResult } from "../models";
import { getCached, addToCache } from "../core/cache/doc-cache";
import { detectImport } from "../core/import-detector";

async function resolveOnline(dep: Dependency): Promise<DocResult | null> {
    switch (dep.ecosystem) {
        case "npm": return onlineNpmResolver(dep);
        case "pip": return onlinePipResolver(dep);
        case "go": return onlineGoResolver(dep);
        case "cargo": return onlineCargoResolver(dep);
        case "maven": return onlineMavenResolver(dep);
        case "pub": return onlinePubResolver(dep);
        case "bundler": return onlineBundlerResolver(dep);
        case "nuget": return onlineNugetResolver(dep);
        default: return null;
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

        if (!detected.name.toLowerCase().includes(hoveredText.toLowerCase())) {
            return null;
        }

        const dep: Dependency = {
            name: detected.name,
            version: null,
            ecosystem: detected.ecosystem
        };

        let result = getCached(dep.ecosystem, dep.name);
        if (result === undefined) {
            result = await registryResolver(dep);
            if (!result?.docUrl) {
                result = await resolveOnline(dep);
            }
            addToCache(dep.ecosystem, dep.name, result);
        }

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