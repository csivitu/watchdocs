import { DocResult, Dependency } from "../../models";

export async function onlinePubResolver(dependency: Dependency): Promise<DocResult | null> {

    const packageName =dependency.name.trim();

    if (!packageName) {
        return null;
    }

    try {

        const controller =new AbortController();

        const timeout = setTimeout(
            () => controller.abort(),
            5000
        );

        const res = await fetch(
            `https://pub.dev/api/packages/${packageName}`,
            {
                signal: controller.signal,
            }
        );

        clearTimeout(timeout);

        if (!res.ok) {
            return null;
        }

        const data = await res.json();

        const resolvedVersion =
            dependency.version ||
            data.latest?.version ||
            null;

        return {
            name: dependency.name,
            version: resolvedVersion,
            docUrl:
                `https://pub.dev/packages/${packageName}`,
            ecosystem: dependency.ecosystem,
            source: "online-registry",
            type: dependency.type
        };

    } catch {

        return null;
    }
}