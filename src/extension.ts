import * as vscode from "vscode";
import { DocsTreeProvider } from "./ui/tree-provider";
import { DocsHoverProvider } from "./ui/hover-provider";


export function activate(context: vscode.ExtensionContext) {
  const provider = new DocsTreeProvider();

  context.subscriptions.push(
  vscode.commands.registerCommand("watchdocs.exportDependencies",() => provider.exportDependencies())
  );
  
  vscode.window.registerTreeDataProvider("watchdocs.sidebar", provider);

  const openDocsCommand = vscode.commands.registerCommand("watchdocs.openDoc", async (url: string) => {
    try {
      await vscode.commands.executeCommand("simpleBrowser.show", url);
    } catch {
      await vscode.env.openExternal(vscode.Uri.parse(url));
    }
  });
  
  const scanCommand = vscode.commands.registerCommand("watchdocs.scan", async () => {
    await provider.scan();
  });

  const searchCommand = vscode.commands.registerCommand("watchdocs.search", async () => {
    await provider.search();
  });

  const clearSearchCommand = vscode.commands.registerCommand("watchdocs.clearSearch", async () => {
    provider.clearSearch();
  });

  const helloCommand = vscode.commands.registerCommand("watchdocs.helloWorld", () => {
    vscode.window.showInformationMessage("Hello from WatchDocs!");
  });

  const watcher = vscode.workspace.createFileSystemWatcher(
    "**/{package.json,requirements.txt,go.mod,Cargo.toml,pom.xml,pyproject.toml,pubspec.yaml,Gemfile}"
  );
  
  watcher.onDidChange(() => provider.scan());
  watcher.onDidCreate(() => provider.scan());
  watcher.onDidDelete(() => provider.scan());
  const refreshCommand = vscode.commands.registerCommand("watchdocs.refreshTreeView", async () => {
    provider.refresh();
  });

  const hoverProvider = vscode.languages.registerHoverProvider(
    [
        "javascript",
        "typescript",
        "javascriptreact",
        "typescriptreact",
        "python",
        "go",
        "rust",
        "java",
        "kotlin",
        "dart",
        "ruby"
    ],
    new DocsHoverProvider()
  );

  context.subscriptions.push(scanCommand, searchCommand, clearSearchCommand, helloCommand, refreshCommand, openDocsCommand, watcher, hoverProvider);
}

export function deactivate() { }