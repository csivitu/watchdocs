import { Dependency, DocResult } from "../../models";
import { GeminiResolver } from "./gemini-resolver";
import { regisrtyResolver } from "./registry-resolver";

export async function resolver(deps: Dependency[]): Promise<DocResult[]>{
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
    if(missingDeps.length > 0){
        const geminiResolver = new GeminiResolver();
        const geminiResults = await geminiResolver.resolve(missingDeps)
        return [...found, ...geminiResults]
    }
    return found
}