import { DocResult, Dependency } from "../../models";

export async function onlineNpmResolver(dependency: Dependency): Promise<DocResult | null> {

    const packageName =
        dependency.name;

    try {

        const controller = new AbortController();
        const timeout = setTimeout(
            () => controller.abort(),
            5000
        );

        const res = await fetch(
            `https://registry.npmjs.org/${packageName}/latest`,
            { signal: controller.signal }
        );

        clearTimeout(timeout);

        if (!res.ok) {
            return null;
        }

        const data = await res.json();

        const docUrl =
            data.homepage || null;

        return {
            name: packageName,
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