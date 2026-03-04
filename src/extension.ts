import * as vscode from "vscode";
import { DocsTreeProvider } from "./ui/tree-provider";

export function activate(context: vscode.ExtensionContext) {

  const provider = new DocsTreeProvider();

  vscode.window.registerTreeDataProvider(
    "watchdocs.sidebar",
    provider
  );

  vscode.commands.registerCommand("watchdocs.scan", () => {
    vscode.window.showInformationMessage("WatchDocs scan started");
  });

}