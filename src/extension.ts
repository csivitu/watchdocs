import * as vscode from "vscode";
import { DocsTreeProvider } from "./ui/tree-provider";

export function activate(context: vscode.ExtensionContext) {
  const provider = new DocsTreeProvider();
  vscode.window.registerTreeDataProvider("watchdocs.sidebar", provider);

  const scanCommand = vscode.commands.registerCommand("watchdocs.scan", () => {
    vscode.window.showInformationMessage("WatchDocs: Scanning dependencies...");
  });

  const helloCommand = vscode.commands.registerCommand("watchdocs.helloWorld", () => {
    vscode.window.showInformationMessage("Hello from WatchDocs!");
  });

  context.subscriptions.push(scanCommand, helloCommand);
}

export function deactivate() { }