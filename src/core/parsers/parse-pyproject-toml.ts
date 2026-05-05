import { Dependency } from "../../models";

export function parsePyProjectToml(content: string): Dependency[] {
  if (!content.trim()) {return [];}

  const result: Dependency[] = [];
  const lines = content.split("\n");

  let section = "";

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) {continue;}

    const sec = line.match(/^\[(.+)\]$/);
    if (sec) {
      section = sec[1];
      continue;
    }
    
    // Poetry
    if (
      section === "tool.poetry.dependencies" ||
      section === "tool.poetry.dev-dependencies"
    ) {
      const m = line.match(/^([\w\-.]+)\s*=\s*(.+)$/);
      if (!m || m[1] === "python") {continue;}

      let version = m[2].replace(/^["']|["']$/g, "");
      const v = version.match(/version\s*=\s*["']([^"']+)["']/);
      if (v) {version = v[1];}

      result.push({
        name: m[1],
        version,
        ecosystem: "pip"
      });
    }

    // PEP 621
    if (section === "project" && line.startsWith("dependencies")) {
      const m = content.match(/dependencies\s*=\s*\[([\s\S]*?)\]/);
      if (!m) {continue;}

      const items = m[1]
        .split(",")
        .map(s => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);

      for (const dep of items) {
        const [name, version] = split(dep);
        result.push({
          name,
          version: version || "unknown",
          ecosystem: "pip"
        });
      }
    }
  }

  return result;
}

function split(dep: string): [string, string | null] {
  const m = dep.match(/^([\w\-.]+)(.*)$/);
  return m ? [m[1], m[2]?.trim() || null] : [dep, null];
}