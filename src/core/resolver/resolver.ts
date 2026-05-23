import { Dependency, DocResult } from "../../models";
import { regisrtyResolver } from "./registry-resolver";
import { onlineNpmResolver } from "./online-npm-resolver";
import { onlinePipResolver } from "./online-pip-resolver";
import { onlineGoResolver } from "./online-go-resolver";
import { onlineCargoResolver } from "./online-cargo-resolver";
import { onlineMavenResolver } from "./online-maven-resolver";
import { onlinePubResolver } from "./online-pub-resolver";

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

export async function resolver(deps: Dependency[], onProgress?: (results: DocResult[]) => void): Promise<DocResult[]>{
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

    const npmDeps = missingDeps.filter(d => d.ecosystem === "npm");
    const pipDeps = missingDeps.filter(d => d.ecosystem === "pip");
    const goDeps = missingDeps.filter(d => d.ecosystem === "go");
    const cargoDeps = missingDeps.filter(d => d.ecosystem === "cargo");
    const mavenDeps = missingDeps.filter(d => d.ecosystem === "maven");
    const pubDeps = missingDeps.filter(d => d.ecosystem === "pub");
    await processWithConcurrency(npmDeps, onlineNpmResolver, (res) => onProgress?.([...res]), found);
    await processWithConcurrency(pipDeps, onlinePipResolver, (res) => onProgress?.([...res]), found);
    await processWithConcurrency(goDeps, onlineGoResolver, (res) => onProgress?.([...res]), found);
    await processWithConcurrency(cargoDeps, onlineCargoResolver, (res) => onProgress?.([...res]), found);
    await processWithConcurrency(mavenDeps, onlineMavenResolver, (res) => onProgress?.([...res]), found);
    await processWithConcurrency(pubDeps, onlinePubResolver, (res) => onProgress?.([...res]), found);

    return found;
}