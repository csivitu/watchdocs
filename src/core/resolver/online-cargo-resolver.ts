import { DocResult, Dependency } from "../../models";

type CrateLinks = {
    documentation?: string | null;
    homepage?: string | null;
    repository?: string | null;
};

type CrateData = {
    links?: CrateLinks | null;
};

type CratesIoResponse = {
    crate?: CrateData | null;
};

export async function onlineCargoResolver(dependency: Dependency): Promise<DocResult | null> {

    const packageName =
        dependency.name.trim().toLowerCase();

    try {

        const res = await fetch(
            `https://crates.io/api/v1/crates/${packageName}`,
            {
                headers: {
                    "User-Agent":
                        "doc-resolver/1.0",
                },
            }
        );

        if (!res.ok) {
            return null;
        }

        const data =(await res.json()) as CratesIoResponse;

        const links =data.crate?.links;

        const docUrl =
            links?.documentation ||
            links?.homepage ||
            links?.repository ||
            null;

        return {
            name: dependency.name,
            version: dependency.version,
            docUrl,
            source: "online-registry",
            type: dependency.type
        };

    } catch {

        return null;
    }
}