import * as vscode from "vscode";
import { Dependency, DocResult } from "../models";
import { resolver } from "../core/resolver/resolver";
import { scanWorkspace } from "../core/scanner/scanner";
import { readFile } from "../core/reader/reader";
import { parsePackageJson, parseRequirementsTxt, parsePyProjectToml, parseGoMod, parseCargotoml, parsePomXml, parsePubspecYaml } from "../core/parsers";

export class DocsTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private scannedDeps: Dependency[] | null = null;
  private resolvedResults: DocResult[] | null = null;

  constructor() {}

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  async scan(): Promise<void> {

    const manifests = await scanWorkspace();
    if (manifests.length === 0) {
      this.scannedDeps = [];
      this.resolvedResults = [];
      this.refresh();
      vscode.window.showInformationMessage("No manifest files found");
      return;
    }

    const allDeps: Dependency[] = [];
    for (const manifest of manifests) {
      const content = await readFile(manifest.uri);
      let deps: Dependency[] = [];

      if (manifest.type === "npm") {
        deps = parsePackageJson(content);
      } else if (manifest.type === "pip") {
        if(manifest.uri.fsPath.endsWith("pyproject.toml")){
          deps = parsePyProjectToml(content);
        } else if (manifest.uri.fsPath.endsWith("requirements.txt")){
          deps = parseRequirementsTxt(content);
        }
      } else if (manifest.type === "go") {
        deps = parseGoMod(content);
      } else if (manifest.type === "cargo") {
        deps = parseCargotoml(content);
      } else if (manifest.type === "maven") {
        deps = parsePomXml(content);
      } else if (manifest.type === "pub") {
        deps = parsePubspecYaml(content);
      }

      allDeps.push(...deps);
    }

    this.scannedDeps = allDeps;

    let statusMessage = vscode.window.setStatusBarMessage("Fetching Documentation...");

    this.resolvedResults = await resolver(allDeps, (partialResults) => {
      this.resolvedResults = partialResults;
      this.refresh();
    });

    statusMessage.dispose();

    if (allDeps.length > 0) {
      vscode.window.showInformationMessage(`Found ${allDeps.length} dependencies`);
    }
    
    this.refresh();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
    if (element && (element as any).children) {
      return (element as any).children;
    }

    const actionItems: vscode.TreeItem[] = [];
    actionItems.push(new DependencyItem("Scan Dependencies", "Action", vscode.TreeItemCollapsibleState.None, {
      command: "watchdocs.scan",
      title: "Scan Dependencies"
    }, "play"));

    const depItems: vscode.TreeItem[] = [];
    if (this.resolvedResults && this.resolvedResults.length > 0) {
      this.resolvedResults
        .filter(r => r.docUrl)
        .forEach(result => {
          depItems.push(new DependencyItem(
            result.name,
            result.version || "unknown",
            vscode.TreeItemCollapsibleState.None,
            {
              command: "watchdocs.openDoc",
              title: "Open Docs",
              arguments: [result.docUrl, result.name, result.version || "unknown"]
            },
            "link-external"
          ));
        });
    } else if (this.scannedDeps !== null && this.scannedDeps.length === 0) {
      depItems.push(new vscode.TreeItem("No dependencies found", vscode.TreeItemCollapsibleState.None));
    }

    return [
      new SectionItem("Actions", actionItems, "zap"),
      new SectionItem("Dependencies", depItems, "file-code")
    ];
  }
}

class SectionItem extends vscode.TreeItem {
  constructor(label: string, children: vscode.TreeItem[], iconName: string) {
    super(label, vscode.TreeItemCollapsibleState.Expanded);
    (this as any).children = children;
    this.iconPath = new vscode.ThemeIcon(iconName);
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

