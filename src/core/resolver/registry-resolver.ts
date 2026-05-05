import { Uri, workspace, extensions } from "vscode";
import { DocResult, Dependency } from "../../models";
import { getRegistry, setRegistry } from "../cache/cache";

async function loadRegistry(ecosystem: string) : Promise<Record<string, string> | undefined>{
    const cached = getRegistry(ecosystem);
    if(cached){ return cached; }
    const fileName = `${ecosystem}.json`;
    const ext = extensions.getExtension("watchdocs.watchdocs");
    if (!ext) {return undefined;}
    const uri = Uri.joinPath(ext.extensionUri, "resources", "registries", fileName);
    try{
        const content = await workspace.fs.readFile(uri);
        const text = new TextDecoder("utf-8").decode(content);
        const registry = JSON.parse(text);
        setRegistry(ecosystem, registry);
        return registry;
    } catch {
        return undefined;
    }
}

export async function regisrtyResolver(dependency: Dependency): Promise<DocResult | null> {
    const registry = await loadRegistry(dependency.ecosystem);
    if (!registry) { return null; }
    const docUrl = registry[dependency.name] || null;
    return {
        name: dependency.name,
        version: dependency.version,
        docUrl: docUrl,
        source: docUrl ? "registry" : "unknown"
    };
}