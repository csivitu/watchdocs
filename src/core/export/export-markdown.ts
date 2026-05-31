import * as vscode from "vscode";

export interface Dependency {
    name: string;
    link: string;
}

export async function exportDependenciesAsMarkdown(
    dependencies: Dependency[]
) {
    const markdown = [
        "# Dependencies",
        "",
        ...dependencies.map(
            dep => `- [${dep.name}](${dep.link})`
        )
    ].join("\n");

    const uri = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.file("dependencies.md"),
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