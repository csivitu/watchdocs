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
      const groupName = section.split(".").pop()?.toLowerCase();
      let type: "dev" | "test" = "dev";
      if (groupName?.includes("test")) {
        type = "test";
      }
      const depMatch = line.match(/^([\w\-.]+)\s*=\s*(.+)$/);
      if (depMatch) {
        const val = depMatch[2].trim();
        if (val !== "[") {
          result.push({
            name: depMatch[1],
            version: val.replace(/^["']|["']$/g, ""),
            ecosystem: "pip",
            type
          });
        }
      }
    }
  }

  result.push(...parseArraySection(content, "project.optional-dependencies"));
  result.push(...parseArraySection(content, "dependency-groups"));

  return result;
}

function split(
  dep: string
): [string, string | null] {
  const lhs = dep.split(";")[0].trim();
  const nameMatch = lhs.match(/^([\w\-.]+)/);
  if (!nameMatch) {
    return [dep, null];
  }
  const name = nameMatch[1];
  const withoutExtras = lhs.replace(/\[[^\]]*\]/g, "").trim();
  const versionSpec = withoutExtras.slice(name.length).trim();
  const cleanVersion = versionSpec.replace(/^[=>!<~~\s]+/g, "").trim() || null;
  return [name, cleanVersion];
}

function parseArraySection(content: string, sectionHeader: string): Dependency[] {
  const result: Dependency[] = [];
  const sectionEscaped = sectionHeader.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const sectionRegex = new RegExp(`\\[${sectionEscaped}\\]([\\s\\S]*?)(?=\\r?\\n\\s*\\[|$)`);
  const match = content.match(sectionRegex);
  
  if (!match) {
    return [];
  }
  
  const sectionContent = match[1];
  const groupRegex = /([\w\-]+)\s*=\s*\[([\s\S]*?)\]/g;
  let groupMatch;
  while ((groupMatch = groupRegex.exec(sectionContent)) !== null) {
    const groupName = groupMatch[1].toLowerCase();
    const arrayContent = groupMatch[2];
    const type: "dev" | "test" = groupName.includes("test") ? "test" : "dev";
    
    const lines = arrayContent.split("\n").map(line => {
      const commentIndex = line.indexOf("#");
      return commentIndex !== -1 ? line.slice(0, commentIndex) : line;
    });
    
    const deps = lines.join(" ")
      .split(",")
      .map(item => item.trim().replace(/^["']|["']$/g, "").trim())
      .filter(Boolean);
      
    for (const dep of deps) {
      const [name, version] = split(dep);
      result.push({
        name,
        version: version || "unknown",
        ecosystem: "pip",
        type
      });
    }
  }
  
  return result;
}