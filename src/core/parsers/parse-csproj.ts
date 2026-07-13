import { Dependency } from "../../models";

export function parseCsproj(content: string): Dependency[] {
    if (!content.trim()) {
        return [];
    }

    const deps: Dependency[] = [];
    const packageRefRegex = /<PackageReference\s+([\s\S]*?)(?:\/>|>([\s\S]*?)<\/PackageReference>)/gi;
    const includeRegex = /(?:Include|Update)\s*=\s*["']([^"']+)["']/i;
    const versionAttrRegex = /Version\s*=\s*["']([^"']+)["']/i;
    const versionElemRegex = /<Version>\s*(.*?)\s*<\/Version>/i;

    let match;
    while ((match = packageRefRegex.exec(content)) !== null) {
        const attributesPart = match[1];
        const innerContent = match[2] || "";

        const includeMatch = attributesPart.match(includeRegex);
        if (includeMatch) {
            const name = includeMatch[1];
            
            const versionAttrMatch = attributesPart.match(versionAttrRegex);
            const versionElemMatch = innerContent.match(versionElemRegex);
            
            const version = versionAttrMatch ? versionAttrMatch[1] : (versionElemMatch ? versionElemMatch[1] : null);

            let type: "prod" | "dev" | "test" = "prod";
            const nameLower = name.toLowerCase();
            
            if (
                nameLower.includes("test") ||
                nameLower.includes("xunit") ||
                nameLower.includes("nunit") ||
                nameLower.includes("mstest") ||
                nameLower.includes("specflow")
            ) {
                type = "test";
            } else if (
                nameLower.includes("analyzer") ||
                nameLower.includes("compiler") ||
                nameLower.includes("build") ||
                nameLower.includes("msbuild") ||
                nameLower.includes("codestyle")
            ) {
                type = "dev";
            }

            deps.push({
                name,
                version,
                ecosystem: "nuget",
                type
            });
        }
    }

    return deps;
}
