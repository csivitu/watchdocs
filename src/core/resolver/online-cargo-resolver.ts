import { DocResult, Dependency } from "../../models";

type CrateData = {
    documentation?: string | null;
    homepage?: string | null;
    repository?: string | null;
};

type CratesIoResponse = {
    crate?: CrateData | null;
};

export async function onlineCargoResolver(dependency: Dependency): Promise<DocResult | null> {

    const packageName =
        dependency.name.trim().toLowerCase();

    try {

        const controller = new AbortController();
        const timeout = setTimeout(
            () => controller.abort(),
            5000
        );

        const res = await fetch(
            `https://crates.io/api/v1/crates/${packageName}`,
            {
                signal: controller.signal,
                headers: {
                    "User-Agent":
                        "doc-resolver/1.0",
                },
            }
        );

        clearTimeout(timeout);

        if (!res.ok) {
            return null;
        }

        const data =(await res.json()) as CratesIoResponse;

        const crate = data.crate;

        const docUrl =
            crate?.documentation ||
            crate?.homepage ||
            crate?.repository ||
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