import * as vscode from "vscode";

const ECOSYSTEM_LABELS: Record<string, string> = {
  npm: "JavaScript / TypeScript",
  pip: "Python",
  go: "Go",
  cargo: "Rust",
  maven: "Java / Kotlin",
  pub: "Dart",
  bundler: "Ruby",
};

type ExportDep = {
  name: string;
  version: string | null;
  docUrl: string | null;
  ecosystem: string;
  type?: string;
};

export async function exportDependenciesAsMarkdown(
  dependencies: ExportDep[]
) {
  const groups: Record<string, Record<string, ExportDep[]>> = {};

  for (const dep of dependencies) {
    const eco = dep.ecosystem;
    const type = dep.type || "prod";
    if (!groups[eco]) { groups[eco] = {}; }
    if (!groups[eco][type]) { groups[eco][type] = []; }
    groups[eco][type].push(dep);
  }

  const lines: string[] = ["# WatchDocs — Dependencies", ""];

  for (const eco of Object.keys(ECOSYSTEM_LABELS)) {
    const typeMap = groups[eco];
    if (!typeMap) { continue; }

    const label = ECOSYSTEM_LABELS[eco] || eco;
    const types = Object.keys(typeMap);

    if (types.length === 1) {
      lines.push(`## ${label}`, "");
      for (const dep of typeMap[types[0]]) {
        const ver = dep.version || "unknown";
        lines.push(`- [${dep.name}](${dep.docUrl}) \`${ver}\``);
      }
    } else {
      lines.push(`## ${label}`, "");
      const order = ["prod", "dev", "test"];
      for (const type of order) {
        const deps = typeMap[type];
        if (!deps || deps.length === 0) { continue; }
        const typeLabel = type === "prod" ? "Production" : type === "dev" ? "Development" : "Test";
        lines.push(`### ${typeLabel}`, "");
        for (const dep of deps) {
          const ver = dep.version || "unknown";
          lines.push(`- [${dep.name}](${dep.docUrl}) \`${ver}\``);
        }
        lines.push("");
      }
    }

    lines.push("");
  }

  const markdown = lines.join("\n");

  const uri = await vscode.window.showSaveDialog({
    defaultUri: vscode.Uri.file("watchdocs-dependencies.md"),
    filters: {
      Markdown: ["md"]
    }
  });

  if (!uri) {
    return;
  }

  await vscode.workspace.fs.writeFile(
    uri,
    Buffer.from(markdown, "utf8")
  );

  vscode.window.showInformationMessage(
    "Dependencies exported successfully."
  );
}
