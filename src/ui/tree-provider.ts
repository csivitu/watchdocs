// to handle sidebar rendering
import * as vscode from "vscode";

export class DocsTreeProvider implements vscode.TreeDataProvider<string> {

  getTreeItem(element: string): vscode.TreeItem {
    return new vscode.TreeItem(element);
  }

  getChildren(): Thenable<string[]> {
    return Promise.resolve(["Run WatchDocs Scan"]);
  }

}