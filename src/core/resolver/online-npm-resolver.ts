import { Uri, workspace, extensions } from "vscode";
import { DocResult, Dependency } from "../../models";

export async function onlineNpmResolver(dependency: Dependency) : Promise<DocResult | null> {
    const packageName = dependency.name
    try {
        const res = await fetch(`https://registry.npmjs.org/${packageName}/latest`);
        if(!res.ok){ return null}
        const data = await res.json()
        const docUrl = data.homepage || null
        return {
            name: packageName,
            version: dependency.version,
            docUrl: docUrl,
            source: "online-registry"
        }
    } catch {
        return null
    }
}