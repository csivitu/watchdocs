import { Dependency } from "../../models";

export function parsePyProjectToml(content: string): Dependency[] {

  if (!content.trim()) {
    return [];
  }

  const result: Dependency[] = [];
  const lines = content.split("\n");

  let section = "";

  for (const raw of lines) {

    const line = raw.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const sec = line.match(/^\[(.+)\]$/);

    if (sec) {
      section = sec[1];
      continue;
    }

   
    if (
      section === "tool.poetry.dependencies" ||
      section === "tool.poetry.dev-dependencies"
    ) {

      const m = line.match(/^([\w\-.]+)\s*=\s*(.+)$/);

      if (!m || m[1] === "python") {
        continue;
      }

      let version = m[2]
        .replace(/^["']|["']$/g, "");

      const v = version.match(
        /version\s*=\s*["']([^"']+)["']/
      );

      if (v) {
        version = v[1];
      }

      result.push({
        name: m[1],
        version,
        ecosystem: "pip",
        type:
          section ===
          "tool.poetry.dev-dependencies"
            ? "dev"
            : "prod"
      });
    }

    
    if (
      section === "project" &&
      line.startsWith("dependencies")
    ) {

      const m = content.match(
        /dependencies\s*=\s*\[([\s\S]*?)\]/
      );

      if (!m) {
        continue;
      }

      const items = m[1]
        .split(",")
        .map(s =>
          s
            .trim()
            .replace(/^["']|["']$/g, "")
        )
        .filter(Boolean);

      for (const dep of items) {

        const [name, version] =
          split(dep);

        result.push({
          name,
          version: version || "unknown",
          ecosystem: "pip",
          type: "prod"
        });
      }
    }

    
    if (
      section.startsWith(
        "project.optional-dependencies"
      )
    ) {

      const groupName =
        section.split(".").pop()?.toLowerCase();

      let type: "dev" | "test" =
        "dev";

      if (
        groupName?.includes("test")
      ) {
        type = "test";
      }

      const depMatch = line.match(/^([\w\-.]+)\s*=\s*(.+)$/);

      if (depMatch) {

        result.push({
          name: depMatch[1],
          version: depMatch[2],
          ecosystem: "pip",
          type
        });
      }
    }

    if (section === "dependency-groups") {
      const groupMatch = line.match(/^(\w+)\s*=\s*\[([^\]]*)\]/);
      if (groupMatch) {
        const groupName = groupMatch[1].toLowerCase();
        const type: "dev" | "test" = groupName.includes("test") ? "test" : "dev";
        const items = groupMatch[2]
          .split(",")
          .map(s => s.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean);
        for (const dep of items) {
          const [name, version] = split(dep);
          result.push({ name, version: version || "unknown", ecosystem: "pip", type });
        }
      }
    }
  }

  return result;
}

function split(
  dep: string
): [string, string | null] {

  const m = dep.match(/^([\w\-.]+)(.*)$/);

  return m
    ? [m[1], m[2]?.trim() || null]
    : [dep, null];
}