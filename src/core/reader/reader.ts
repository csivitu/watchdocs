import { Uri, workspace } from "vscode";

const decoder = new TextDecoder('utf-8')
export async function readFile(uri: Uri) : Promise<string> {
    const fileBytes = await workspace.fs.readFile(uri)
    return decoder.decode(fileBytes)
}