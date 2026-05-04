import { Dependency, DocResult } from "../../models";
import { GeminiResolver } from "./gemini-resolver";
import { regisrtyResolver } from "./registry-resolver";
import { onlineNpmResolver } from "./online-npm-resolver";
import { onlinePipResolver } from "./online-pip-resolver";
import { ExtensionContext } from "vscode";

export async function resolver(deps: Dependency[], context: ExtensionContext, onProgress?: (results: DocResult[]) => void): Promise<DocResult[]>{
    const registryResults = await Promise.all(deps.map(regisrtyResolver));
    const found: DocResult[] = [];
    const missingDeps: Dependency[] = [];
    const forGeminiDeps: Dependency[] = [];
    deps.forEach((dep, i) => {
        const result = registryResults[i];
        if(result && result.docUrl){
            found.push(result);
        } else {
            missingDeps.push(dep);
        }
    });
    
    if (onProgress) {
      onProgress(found);
    }
    const npmDeps = missingDeps.filter(d => d.ecosystem === "npm");
    if(npmDeps.length>0){
        const onlineResults = await Promise.all(npmDeps.map(onlineNpmResolver));
        onlineResults.forEach((r, i)=>{
            if(r?.docUrl){ 
                found.push(r);
            } else {
                forGeminiDeps.push(npmDeps[i]);
            } 
        onProgress?.(found);
        });
        
    }

    const pipDeps = missingDeps.filter(d => d.ecosystem === "pip");
    if(pipDeps.length > 0){
        const onlineResults = await Promise.all(pipDeps.map(onlinePipResolver));
        onlineResults.forEach((r, i)=>{
            if(r?.docUrl){
                found.push(r);
            } else {
                forGeminiDeps.push(pipDeps[i]);
            }
        onProgress?.(found);
        });
    }
    
    if(forGeminiDeps.length > 0){
        const geminiResolver = new GeminiResolver(context);
        try {
            const geminiResults = await geminiResolver.resolve(forGeminiDeps);
            return [...found, ...geminiResults];
        } catch {
            return [...found, ...forGeminiDeps.map(d => ({
                name: d.name,
                version: d.version,
                docUrl: null,
                source: "unknown" as const
            }))];
        }
    }
    return found;
}