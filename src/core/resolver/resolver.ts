import { Dependency, DocResult } from "../../models";
import { GeminiResolver } from "./gemini-resolver";
import { regisrtyResolver } from "./registry-resolver";
import { ExtensionContext } from "vscode";

export async function resolver(deps: Dependency[], context: ExtensionContext, onProgress?: (results: DocResult[]) => void): Promise<DocResult[]>{
    const registryResults = await Promise.all(deps.map(regisrtyResolver));
    const found: DocResult[] = []
    const missingDeps: Dependency[] = []
    deps.forEach((dep, i) => {
        const result = registryResults[i]
        if(result && result.docUrl){
            found.push(result)
        } else {
            missingDeps.push(dep)
        }
    })
    
    if (onProgress) {
      onProgress(found)
    }
    
    if(missingDeps.length > 0){
        const geminiResolver = new GeminiResolver(context);
        try {
            const geminiResults = await geminiResolver.resolve(missingDeps)
            return [...found, ...geminiResults]
        } catch {
            return [...found, ...missingDeps.map(d => ({
                name: d.name,
                version: d.version,
                docUrl: null,
                source: "unknown" as const
            }))]
        }
    }
    return found
}