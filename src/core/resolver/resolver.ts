import { Dependency, DocResult } from "../../models";
import { GeminiResolver } from "./gemini-resolver";
import { regisrtyResolver } from "./registry-resolver";
import { onlineNpmResolver } from "./online-npm-resolver";
import { onlinePipResolver } from "./online-pip-resolver";
import { onlineGoResolver } from "./online-go-resolver";
import { onlineCargoResolver } from "./online-cargo-resolver";
import { ExtensionContext } from "vscode";

async function processWithConcurrency<T, R>(
    items: T[], 
    processor: (item: T) => Promise<R | null>, 
    onBatchComplete: (results: R[]) => void, 
    found: R[]
): Promise<T[]> {
    const queue = [...items];
    const failed: T[] = [];
    let completedCount = 0;

    const worker = async () => {
        while (queue.length > 0) {
            const item = queue.shift();
            if (!item) {break;}
            const res = await processor(item);
            if (res) {
                found.push(res);
                completedCount++;
                if (completedCount % 4 === 0) {
                    onBatchComplete(found);
                }
            } else {
                failed.push(item);
            }
        }
    };

    await Promise.all(Array(16).fill(null).map(worker));
    onBatchComplete(found);
    return failed;
}

export async function resolver(deps: Dependency[], context: ExtensionContext, onProgress?: (results: DocResult[]) => void): Promise<DocResult[]>{
    const registryResults = await Promise.all(deps.map(regisrtyResolver));
    const found: DocResult[] = [];
    const missingDeps: Dependency[] = [];
    
    deps.forEach((dep, i) => {
        const result = registryResults[i];
        if(result && result.docUrl){
            found.push(result);
        } else {
            missingDeps.push(dep);
        }
    });
    
    if (onProgress) {onProgress(found);}

    const forGeminiDeps: Dependency[] = [];
    
    const npmDeps = missingDeps.filter(d => d.ecosystem === "npm");
    const pipDeps = missingDeps.filter(d => d.ecosystem === "pip");
    const goDeps = missingDeps.filter(d => d.ecosystem === "go");
    const cargoDeps = missingDeps.filter(d => d.ecosystem === "cargo");

    const failedNpm = await processWithConcurrency(npmDeps, onlineNpmResolver, (res) => onProgress?.([...res]), found);
    const failedPip = await processWithConcurrency(pipDeps, onlinePipResolver, (res) => onProgress?.([...res]), found);
    const failedGo = await processWithConcurrency(goDeps, onlineGoResolver, (res) => onProgress?.([...res]), found);
    const failedCargo = await processWithConcurrency(cargoDeps, onlineCargoResolver, (res) => onProgress?.([...res]), found);

    forGeminiDeps.push(...failedNpm, ...failedPip, ...failedGo, ...failedCargo);
    
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