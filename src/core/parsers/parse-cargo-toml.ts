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

    if (trimmed === "[dependencies]") {
      currentType = "prod";
      continue;
    }

    if (trimmed === "[dev-dependencies]") {
      currentType = "dev";
      continue;
    }

    if (trimmed === "[test-dependencies]") {
      currentType = "test";
      continue;
    }

    if (trimmed.startsWith("[")) {
      currentType = null;
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
          deps.push({
            name: tableMatch[1],
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