import * as vscode from "vscode";
import { DocsTreeProvider } from "./ui/tree-provider";
import { GeminiResolver } from "./core/resolver/gemini-resolver";

export function activate(context: vscode.ExtensionContext) {
  const provider = new DocsTreeProvider(context);
  vscode.window.registerTreeDataProvider("watchdocs.sidebar", provider);

  const scanCommand = vscode.commands.registerCommand("watchdocs.scan", () => {
    vscode.window.showInformationMessage("WatchDocs: Scanning dependencies...");
  });

  const helloCommand = vscode.commands.registerCommand("watchdocs.helloWorld", () => {
    vscode.window.showInformationMessage("Hello from WatchDocs!");
  });

  const setApiKeyCommand = vscode.commands.registerCommand("watchdocs.setApiKey", async () => {
    await GeminiResolver.setApiKey(context);
    provider.refresh();
  });

  context.subscriptions.push(scanCommand, helloCommand, setApiKeyCommand);
}

export function deactivate() { }