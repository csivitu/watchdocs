import { Dependency } from "../../models";

export function parseCargotoml(content: string): Dependency[] {

  if (!content.trim()) {
    return [];
  }

  const lines = content.split("\n");
  const deps: Dependency[] = [];

  let currentType: "prod" | "dev" | "test" | null = null;

  for (const line of lines) {

    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    if (trimmed.startsWith("[")) {
      if (trimmed.includes("dependencies")) {
        if (trimmed.match(/dev[-_]dependencies/)) {
          currentType = "dev";
        } else if (trimmed.match(/test[-_]dependencies/)) {
          currentType = "test";
        } else {
          currentType = "prod";
        }
      } else {
        currentType = null;
      }
      continue;
    }

    if (currentType && !trimmed.startsWith("#")) {

      const match = trimmed.match( /^(\S+)\s*=\s*"([^"]+)"/);

      if (match) {

        deps.push({
          name: match[1],
          version: match[2],
          ecosystem: "cargo",
          type: currentType
        });

      } else {

        const tableMatch = trimmed.match(/^([\w\-.]+)\s*=\s*\{/);
        if (tableMatch) {
          const versionMatch = trimmed.match(/version\s*=\s*"([^"]+)"/);
          const packageMatch = trimmed.match(/package\s*=\s*"([^"]+)"/);
          deps.push({
            name: packageMatch?.[1] ?? tableMatch[1],
            version: versionMatch?.[1] ?? null,
            ecosystem: "cargo",
            type: currentType
          });
        }
      }
    }
  }

  return deps;
}