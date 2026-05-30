import { DocResult, Dependency } from "../../models";

// pypi response thoda nested so for ts clarity
// and keep type explicit for pip

type PyPiProjectUrls =
    Record<string, string | null | undefined>;

type PyPiPackageInfo = {
    home_page?: string | null;
    project_urls?: PyPiProjectUrls | null;
};

type PyPiResponse = {
    info?: PyPiPackageInfo | null;
};

export async function onlinePipResolver(dependency: Dependency): Promise<DocResult | null> {

    const packageName =
        dependency.name
            .trim()
            .toLowerCase();

    try {

        const controller = new AbortController();
        const timeout = setTimeout(
            () => controller.abort(),
            5000
        );

        const res = await fetch(
            `https://pypi.org/pypi/${packageName}/json`,
            { signal: controller.signal }
        );

        clearTimeout(timeout);

        if (!res.ok) {
            return null;
        }

        const data =
            (await res.json()) as PyPiResponse;

        const info = data.info;

        const docUrl =
            info?.project_urls?.Documentation ||
            info?.project_urls?.Homepage ||
            info?.home_page ||
            null;

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