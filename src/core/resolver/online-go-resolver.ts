import { DocResult, Dependency } from "../../models";

export async function onlineGoResolver(dependency: Dependency): Promise<DocResult | null> {

    const moduleName =
        dependency.name.trim();

    if (!moduleName) {
        return null;
    }

    try {

        const controller =
            new AbortController();

        const timeout = setTimeout(
            () => controller.abort(),
            5000
        );

        const res = await fetch(
            `https://proxy.golang.org/${moduleName}/@v/list`,
            {
                signal: controller.signal
            }
        );

        clearTimeout(timeout);

        if (!res.ok) {
            return null;
        }

        const docUrl =
            dependency.version
                ? `https://pkg.go.dev/${moduleName}@${dependency.version}`
                : `https://pkg.go.dev/${moduleName}`;

        return {
            name: dependency.name,
            version: dependency.version,
            docUrl,
            ecosystem: dependency.ecosystem,
            source: "online-registry",
            type: dependency.type
        };

    } catch (err) {

        console.error(
            "Go resolver failed:",
            err
        );

        return null;
    }
}