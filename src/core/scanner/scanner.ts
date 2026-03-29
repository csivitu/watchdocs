// to find manifest files in workspace
import { workspace } from "vscode";
import { ManifestFile } from "../../models";

export async function scanWorkspace() : Promise<ManifestFile[]> {
    var rootFiles = workspace.workspaceFolders
    if(!rootFiles || rootFiles.length === 0){ return[] } 
    var include = "{**/package.json,**/go.mod,**/requirements.txt}" 
    var exclude = "{**/node_modules/**,**/dist/**,**/build/**,**/.git/**}"
    const uris = await workspace.findFiles(include, exclude)
    return uris.map((uri) : ManifestFile => {
        const uriPath = uri.fsPath.toLowerCase()
        switch (true) {
            case uriPath.endsWith("package.json"):
                return { uri, type: "npm"}
            case uriPath.endsWith("requirements.txt"):
                return { uri, type: "pip"}
            case uriPath.endsWith("go.mod"):
                return { uri, type: "go"} //aadya
            default:
                return { uri, type: "unknown"}
        }
    })
}
