import { Dependency } from "../../models";

export function parsePackageJson(content: string): Dependency[] {

  if (!content.trim()) {
    return [];
  }

  try {

    const data = JSON.parse(content);
    const result: Dependency[] = [];

    const addDependencies = (
      deps: Record<string, string>,
      type: "prod" | "dev" | "test"
    ) => {

      for (const name in deps) {
        result.push({
          name,
          version: deps[name] || "unknown",
          ecosystem: "npm",
          type
        });
      }
    };

    addDependencies(data.dependencies || {},"prod");

    addDependencies(data.devDependencies || {},"dev");

    return result;

  } catch {
    return [];
  }
}