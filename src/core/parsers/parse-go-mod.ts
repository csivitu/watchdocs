import { Dependency } from "../../models";

export function parseGoMod(content: string): Dependency[] {

  if (!content.trim()) {
    return [];
  }

  const lines = content.split("\n");
  const deps: Dependency[] = [];

  let inRequireBlock = false;

  for (const line of lines) {

    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

   
    if (trimmed === "require (") {
      inRequireBlock = true;
      continue;
    }

    if (trimmed === ")") {
      inRequireBlock = false;
      continue;
    }

    const singleMatch = trimmed.match(/^require\s+(\S+)\s+(\S+)/);

    if (singleMatch) {

      deps.push({
        name: singleMatch[1],
        version: singleMatch[2],
        ecosystem: "go",
        type: "prod"
      });

      continue;
    }

    if (inRequireBlock && !trimmed.startsWith("//")) {

      const blockMatch = trimmed.match(/^(\S+)\s+(\S+)/);

      if (blockMatch) {

        deps.push({
          name: blockMatch[1],
          version: blockMatch[2],
          ecosystem: "go",
          type: "prod"
        });

      }
    }
  }

  return deps;
}