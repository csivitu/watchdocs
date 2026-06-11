import * as vscode from "vscode";
import fuzzysort from "fuzzysort";
import { Dependency, DocResult } from "../models";
import { resolver } from "../core/resolver/resolver";
import { scanWorkspace } from "../core/scanner/scanner";
import { exportDependenciesAsMarkdown } from "../core/export/export-markdown";
import { readFile } from "../core/reader/reader";
import { parsePackageJson, parseRequirementsTxt, parsePyProjectToml, parseGoMod, parseCargotoml, parsePomXml, parsePubspecYaml, parseGemfile, parseUvLock } from "../core/parsers";
import { setScanResults } from "../core/cache/doc-cache";
import { deduplicateDeps } from "../core/dedup";

const ECOSYSTEM_LABELS: Record<string, { label: string; icon: string }> = {
  npm: { label: "JavaScript", icon: "json" },
  pip: { label: "Python", icon: "python" },
  go: { label: "Go", icon: "terminal-powershell" },
  cargo: { label: "Rust", icon: "shield" },
  maven: { label: "Java", icon: "coffee" },
  pub: { label: "Dart", icon: "device-mobile" },
  bundler: { label: "Ruby", icon: "ruby" },
};

export class DocsTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private scannedDeps: Dependency[] | null = null;
  private resolvedResults: DocResult[] | null = null;
  private searchQuery: string = "";
  private _quickPick: vscode.QuickPick<vscode.QuickPickItem> | null = null;
  private lastManifestFingerprint: string = "";
  private lastResolvedResults: DocResult[] = [];
  private lastScannedDeps: Dependency[] = [];

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

    const snapshotData = await Promise.all(
      manifests.map(async m => {
        const stat = await vscode.workspace.fs.stat(m.uri);
        return { uri: m.uri.toString(), mtime: stat.mtime };
      })
    );
    const fingerprint = JSON.stringify(snapshotData.sort((a, b) => a.uri.localeCompare(b.uri)));

    if (fingerprint === this.lastManifestFingerprint && this.lastResolvedResults.length > 0) {
      this.scannedDeps = this.lastScannedDeps;
      this.resolvedResults = this.lastResolvedResults;
      setScanResults(this.resolvedResults);
      this.refresh();
      this._ensureQuickPick();
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
        } else if (manifest.uri.fsPath.endsWith("uv.lock")){
          deps = parseUvLock(content);
        }
      } else if (manifest.type === "go") {
        deps = parseGoMod(content);
      } else if (manifest.type === "cargo") {
        deps = parseCargotoml(content);
      } else if (manifest.type === "maven") {
        deps = parsePomXml(content);
      } else if (manifest.type === "pub") {
        deps = parsePubspecYaml(content);
      }else if (manifest.type === "bundler") {
        deps = parseGemfile(content);
      }

      allDeps.push(...deps);
    }

    const deduped = deduplicateDeps(allDeps);

    this.scannedDeps = deduped;

    let statusMessage = vscode.window.setStatusBarMessage("Fetching Documentation...");

    this.resolvedResults = await resolver(this.scannedDeps, (partialResults) => {
      this.resolvedResults = partialResults;
      this.refresh();
    });

    statusMessage.dispose();

    setScanResults(this.resolvedResults);
    this.lastManifestFingerprint = fingerprint;
    this.lastResolvedResults = this.resolvedResults;
    this.lastScannedDeps = this.scannedDeps;

    this.refresh();
    this._ensureQuickPick();
  }

  async search(): Promise<void> {
    if (!this.resolvedResults || this.resolvedResults.length === 0) {
      vscode.window.showInformationMessage("Scan dependencies first before searching");
      return;
    }

    if (!this._quickPick) {
      this._ensureQuickPick();
    }

    this._quickPick!.value = "";
    this._quickPick!.items = [];
    this._quickPick!.show();
  }


  private _ensureQuickPick(): void {
    if (this._quickPick) {
      return;
    }

    const searchable = (this.resolvedResults || []).filter(r => r.docUrl);
    fuzzysort.go("", searchable, { key: "name" });

    const quickPick = vscode.window.createQuickPick();
    quickPick.title = "Search Dependencies";
    quickPick.placeholder = "Type to search dependencies...";
    quickPick.ignoreFocusOut = true;
    quickPick.buttons = [{ iconPath: new vscode.ThemeIcon("close"), tooltip: "Close Search" }];

    quickPick.onDidTriggerButton(() => quickPick.hide());

    quickPick.onDidChangeValue((value) => {
      const results = this.resolvedResults?.filter(r => r.docUrl) || [];
      if (!value || value.trim() === "") {
        quickPick.items = [];
        return;
      }

      const fuzzyResults = fuzzysort.go(value, results, {
        key: "name",
        limit: 10,
        threshold: -10000
      });

      if (fuzzyResults.length === 0) {
        quickPick.items = [
          { label: `No matches for "${value}"` },
          { label: "Clear search", iconPath: new vscode.ThemeIcon("clear-all"), alwaysShow: true }
        ];
        return;
      }
      
      quickPick.items = fuzzyResults.map(r => ({
        label: r.obj.name,
        description: r.obj.version || "unknown",
        detail: r.obj.docUrl || undefined
      }));
    });

    quickPick.onDidAccept(() => {
      const selected = quickPick.selectedItems[0];
      if (!selected) { return; }

      if (selected.label === "Clear search") {
        quickPick.value = "";
        quickPick.items = [];
        return;
      }

      if (selected.detail) {
        vscode.commands.executeCommand("watchdocs.openDoc", selected.detail);
        quickPick.hide();
      }
    });

    this._quickPick = quickPick;
  }

  clearSearch(): void {
    this.searchQuery = "";
    this.refresh();
  }

  async exportDependencies(): Promise<void> {

  if (!this.resolvedResults || this.resolvedResults.length === 0) {
    vscode.window.showInformationMessage("No dependencies to export");
    return;
  }

  const dependencies = this.resolvedResults.filter(dep => dep.docUrl).map(dep => ({
      name: dep.name,
      link: dep.docUrl!
    }));

  await exportDependenciesAsMarkdown(dependencies);
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

   if (this.resolvedResults && this.resolvedResults.length > 0) {

  actionItems.push(new DependencyItem("Search Dependencies", "Action", vscode.TreeItemCollapsibleState.None, {
    command: "watchdocs.search",
    title: "Search Dependencies"
  }, "search"));

  actionItems.push(new DependencyItem("Export Dependencies (.md)","Action",vscode.TreeItemCollapsibleState.None,{
    command: "watchdocs.exportDependencies",
    title: "Export Dependencies"
  },"export"));

      if (this.searchQuery) {
        actionItems.push(new DependencyItem("Clear Search", "Action", vscode.TreeItemCollapsibleState.None, {
          command: "watchdocs.clearSearch",
          title: "Clear Search"
        }, "close"));
      }
    }

    const dependencySections: vscode.TreeItem[] = [];

if (
  this.resolvedResults &&
  this.resolvedResults.length > 0
) {

  let results =this.resolvedResults.filter(r => r.docUrl);

  if (this.searchQuery) {

    const fuzzyResults = fuzzysort.go(
      this.searchQuery,
      results,
      {
        key: "name",
        limit: 50,
        threshold: -10000
      }
    );

    results =fuzzyResults.map(r => r.obj);

    if (results.length === 0) {

      dependencySections.push(new vscode.TreeItem(`No matches for "${this.searchQuery}"`,vscode.TreeItemCollapsibleState.None));
    }
  }

  const groups: Record<string, { prod: DependencyItem[]; dev: DependencyItem[]; test: DependencyItem[] }> = {};
  for (const eco of Object.keys(ECOSYSTEM_LABELS)) {
    groups[eco] = { prod: [], dev: [], test: [] };
  }

  results.forEach(result => {
    const eco = result.ecosystem;
    if (!groups[eco]) { return; }

    const item = new DependencyItem(
      result.name,
      result.version || "unknown",
      vscode.TreeItemCollapsibleState.None,
      {
        command: "watchdocs.openDoc",
        title: "Open Docs",
        arguments: [result.docUrl, result.name, result.version || "unknown"]
      },
      "link-external"
    );

    if (result.type === "dev") { groups[eco].dev.push(item); }
    else if (result.type === "test") { groups[eco].test.push(item); }
    else { groups[eco].prod.push(item); }
  });

  for (const [eco, types] of Object.entries(groups)) {
    const typeSections: vscode.TreeItem[] = [];
    if (types.prod.length > 0) { typeSections.push(new SectionItem("Production", types.prod, "package")); }
    if (types.dev.length > 0) { typeSections.push(new SectionItem("Development", types.dev, "tools")); }
    if (types.test.length > 0) { typeSections.push(new SectionItem("Test", types.test, "beaker")); }

    if (typeSections.length > 0) {
      const label = ECOSYSTEM_LABELS[eco]?.label ?? eco;
      const icon = ECOSYSTEM_LABELS[eco]?.icon ?? "file-code";
      dependencySections.push(new SectionItem(label, typeSections, icon));
    }
  }

} else if (
  this.scannedDeps !== null &&
  this.scannedDeps.length === 0
) {

  dependencySections.push(new vscode.TreeItem("No dependencies found",vscode.TreeItemCollapsibleState.None));
}

    return [
      new SectionItem("Actions", actionItems, "zap"),
      new SectionItem("Dependencies",dependencySections,"file-code")
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
    iconName: string = "library"
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.label}-${this.version}`;
    this.description = this.version;
    this.iconPath = new vscode.ThemeIcon(iconName);
  }
}

