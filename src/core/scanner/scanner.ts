// to find manifest files in workspace
import { workspace } from "vscode";
import { ManifestFile } from "../../models";

export async function scanWorkspace(): Promise<ManifestFile[]> {
    const rootFiles = workspace.workspaceFolders;
    if (!rootFiles || rootFiles.length === 0) { return []; }
    const include = "**/{package.json,go.mod,requirements.txt,pyproject.toml,Cargo.toml,pom.xml,pubspec.yaml,Gemfile,uv.lock}";
    const exclude = "{**/node_modules/**,**/dist/**,**/build/**,**/.git/**}";
    const uris = await workspace.findFiles(include, exclude);
    return uris.map((uri): ManifestFile => {
        const uriPath = uri.fsPath.toLowerCase();
        switch (true) {
            case uriPath.endsWith("package.json"):
                return { uri, type: "npm" };
            case uriPath.endsWith("requirements.txt"):
                return { uri, type: "pip" };
            case uriPath.endsWith("pyproject.toml"):
                return { uri, type: "pip" };
            case uriPath.endsWith("go.mod"):
                return { uri, type: "go" };
            case uriPath.endsWith("cargo.toml"):
                return { uri, type: "cargo" };
            case uriPath.endsWith("pom.xml"):
                return { uri, type: "maven" };
            case uriPath.endsWith("pubspec.yaml"):
                return { uri, type: "pub" };
            case uriPath.endsWith("gemfile"):
                return { uri, type: "bundler" };
            case uriPath.endsWith("uv.lock"):
                return { uri, type: "pip" };
            default:
                return { uri, type: "unknown" };
        }
    });
}
