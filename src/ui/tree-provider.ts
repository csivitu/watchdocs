import * as vscode from "vscode";

export class DocsTreeProvider implements vscode.TreeDataProvider<DependencyItem> {

  getTreeItem(element: DependencyItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: DependencyItem): Thenable<DependencyItem[]> {
    if (element) {
      return Promise.resolve([]);
    }

    // Mock data for initial sidebar
    return Promise.resolve([
      new DependencyItem("Scan Dependencies", "Action", vscode.TreeItemCollapsibleState.None, {
        command: "watchdocs.scan",
        title: "Scan Dependencies"
      }, "play"),
      new DependencyItem("react", "18.2.0", vscode.TreeItemCollapsibleState.None, {
        command: "vscode.open",
        title: "Open Docs",
        arguments: [vscode.Uri.parse("https://reactjs.org/docs/getting-started.html")]
      }, "library"),
      new DependencyItem("express", "4.18.2", vscode.TreeItemCollapsibleState.None, {
        command: "vscode.open",
        title: "Open Docs",
        arguments: [vscode.Uri.parse("https://expressjs.com/en/starter/installing.html")]
      }, "library")
    ]);
  }

}

class DependencyItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command,
    private iconName: string = "library"
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.label}-${this.version}`;
    this.description = this.version;
    this.iconPath = new vscode.ThemeIcon(iconName);
  }
}

