import * as vscode from "vscode";
import { Dependency } from "../models";
import { GeminiResolver } from "../core/resolver/gemini-resolver";
import { resolver } from "../core/resolver/resolver";
import { scanWorkspace } from "../core/scanner/scanner";
import { readFile } from "../core/reader/reader";
import { parsePackageJson, parseRequirementsTxt } from "../core/parsers";

export class DocsTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private scannedDeps: Dependency[] | null = null;

  constructor(private context: vscode.ExtensionContext) {}

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  async scan(): Promise<void> {
    const manifests = await scanWorkspace();
    const allDeps: Dependency[] = [];

    for (const manifest of manifests) {
      const content = await readFile(manifest.uri);
      let deps: Dependency[] = [];

      if (manifest.type === "npm") {
        deps = parsePackageJson(content);
      } else if (manifest.type === "pip") {
        deps = parseRequirementsTxt(content);
      }

      allDeps.push(...deps);
    }

    this.scannedDeps = allDeps;
    this.refresh();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
    if (element) {
      return Promise.resolve([]);
    }

    const hasApiKey = await GeminiResolver.hasApiKey(this.context);

    const items: vscode.TreeItem[] = [];

    items.push(new DependencyItem("Scan Dependencies", "Action", vscode.TreeItemCollapsibleState.None, {
      command: "watchdocs.scan",
      title: "Scan Dependencies"
    }, "play"));

    const deps = this.scannedDeps || [];

    if (deps.length > 0) {
      const results = await resolver(deps, this.context);

      results.forEach(result => {
        items.push(new DependencyItem(
          result.name,
          result.version || "unknown",
          vscode.TreeItemCollapsibleState.None,
          result.docUrl ? {
            command: "vscode.open",
            title: "Open Docs",
            arguments: [vscode.Uri.parse(result.docUrl)]
          } : undefined,
          result.docUrl ? "library" : "question"
        ));
      });
    } else if (this.scannedDeps !== null) {
      items.push(new vscode.TreeItem("No dependencies found", vscode.TreeItemCollapsibleState.None));
    }

    items.push(new ApiKeyItem(hasApiKey, this.context));

    return items;
  }
}

class ApiKeyItem extends vscode.TreeItem {
  constructor(
    hasApiKey: boolean,
    private context: vscode.ExtensionContext
  ) {
    super(
      hasApiKey ? "Gemini API Key Exist" : "Add Gemini API Key",
      vscode.TreeItemCollapsibleState.None
    );
    this.command = {
      command: "watchdocs.setApiKey",
      title: "Set Gemini API Key"
    };
    this.iconPath = new vscode.ThemeIcon(hasApiKey ? "check" : "key");
    this.tooltip = hasApiKey ? "Gemini API Key is set" : "Click to add your Gemini API Key";
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

