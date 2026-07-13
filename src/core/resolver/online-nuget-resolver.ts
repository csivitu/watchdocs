import { DocResult, Dependency } from "../../models";

export async function onlineNugetResolver(dependency: Dependency): Promise<DocResult | null> {
    const packageName = dependency.name.trim();

    if (!packageName) {
        return null;
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(
            () => controller.abort(),
            5000
        );

        const res = await fetch(
            `https://api.nuget.org/v3/registration5-semver1/${packageName.toLowerCase()}/index.json`,
            { 
                method: "HEAD",
                signal: controller.signal 
            }
        );

        clearTimeout(timeout);

        if (!res.ok) {
            return null;
        }

        const docUrl = `https://www.nuget.org/packages/${packageName}`;

        return {
            name: dependency.name,
            version: dependency.version,
            docUrl,
            ecosystem: dependency.ecosystem,
            source: "online-registry",
            type: dependency.type
        };

    } catch {
        return null;
    }
}
