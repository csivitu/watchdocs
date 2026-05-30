import { Dependency } from "../../models";

export function parseGemfile(content: string): Dependency[] {

  if (!content.trim()) {
    return [];
  }

  const lines = content.split("\n");
  const deps: Dependency[] = [];

  let currentType: "prod" | "dev" | "test" = "prod";

  for (const line of lines) {

    const trimmed = line.trim();

    if (trimmed.startsWith("#") || !trimmed) {
      continue;
    }

    if (trimmed.match(/^group\s+:?(development|dev).*do/)) {
      currentType = "dev";
      continue;
    }

    if (trimmed.match(/^group\s+:?test.*do/)) {
      currentType = "test";
      continue;
    }

    if (trimmed.match(/^group\s+:?(development|dev)\s*,\s*:test.*do/)) {
      currentType = "dev";
      continue;
    }

    if (trimmed === "end") {
      currentType = "prod";
      continue;
    }

    const gemMatch = line.match(/^\s*gem\s+["']([^"']+)["'](?:\s*,\s*["']([^"']+)["'])?/);

    if (gemMatch) {

      const name = gemMatch[1];

      let version: string | null = gemMatch[2] ?? null;

      if (version) {
        version = version.replace(/['"]/g, "").trim();
      }

      if (!deps.find(d => d.name === name)) {

        deps.push({
          name,
          version,
          ecosystem: "bundler",
          type: currentType
        });

      }
    }
  }

  return deps;
}