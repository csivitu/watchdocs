import * as vscode from "vscode";
import { DocsTreeProvider } from "./ui/tree-provider";

export function activate(context: vscode.ExtensionContext) {
  const provider = new DocsTreeProvider();
  
  vscode.window.registerTreeDataProvider("watchdocs.sidebar", provider);

  const openDocsCommand = vscode.commands.registerCommand("watchdocs.openDoc", async (url: string) => {
    await vscode.commands.executeCommand("simpleBrowser.show", url);
  });
  
  const scanCommand = vscode.commands.registerCommand("watchdocs.scan", async () => {
    await provider.scan();
  });

  const helloCommand = vscode.commands.registerCommand("watchdocs.helloWorld", () => {
    vscode.window.showInformationMessage("Hello from WatchDocs!");
  });

  const refreshCommand = vscode.commands.registerCommand("watchdocs.refreshTreeView", async () => {
    provider.refresh();
  });

  context.subscriptions.push(scanCommand, helloCommand, refreshCommand, openDocsCommand);
}

export function deactivate() { }