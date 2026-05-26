import { Dependency } from "../../models";

export function parseGemfile(content: string): Dependency[] {
  if (!content.trim()) { return []; }

  const lines = content.split("\n");
  const deps: Dependency[] = [];

  let inGroupBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("#") || !trimmed) { continue; }

   
    const matchBlock = trimmed.match(/^(group\s+:?\w+.*do|end)$/);

    if (matchBlock) {
      if (trimmed.startsWith("group")) {
        inGroupBlock = true;
      } else if (trimmed === "end") {
        inGroupBlock = false;
      }
      continue;
    }

   
    if (inGroupBlock || trimmed.startsWith("gem")) {

     
      const gemMatch = line.match(
        /^\s*gem\s+["']([^"']+)["'](?:\s*,\s*["']([^"']+)["'])?/
      );

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
            ecosystem: "bundler"
          });
        }
      }
    }
  }

  return deps;
}