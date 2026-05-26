import { DocResult, Dependency } from "../../models";

export async function onlineBundlerResolver(
    dependency: Dependency
): Promise<DocResult | null> {

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
            `https://rubygems.org/api/v1/gems/${packageName}.json`,
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
            data.version ||
            null;

        return {
            name: dependency.name,
            version: resolvedVersion,
            docUrl:
                data.documentation_uri ||
                data.homepage_uri ||
                data.source_code_uri ||
                `https://rubygems.org/gems/${packageName}`,
            source: "online-registry",
        };

    } catch (err) {
        console.error("Bundler resolver failed:", err);

        return null;
    }
}