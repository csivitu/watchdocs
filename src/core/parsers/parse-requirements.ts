import { Dependency } from "../../models";

export function parseRequirementsTxt(content: string): Dependency[] {

  if (!content.trim()) {
    return [];
  }

  const operators = ["==",">=","<=","!=","~=",">","<"];

  const lines = content.split("\n");
  const deps: Dependency[] = [];

  for (const line of lines) {

    const trimmed = line.trim();

   
    if (!trimmed ||trimmed.startsWith("#")) {
      continue;
    }

    const lhs = trimmed.split(";")[0].trim();
    if (!lhs) {
      continue;
    }

    const nameMatch = lhs.match(/^([\w\-.]+)/);
    if (!nameMatch) {
      continue;
    }
    const name = nameMatch[1];

    const withoutExtras = lhs.replace(/\[[^\]]*\]/g, "").trim();
    const versionSpec = withoutExtras.slice(name.length).trim();
    const version = versionSpec.replace(/^[=>!<~~\s]+/g, "").trim() || "unknown";

    let type: "prod" | "dev" | "test" = "prod";
    const lowerName = name.toLowerCase();

    
    if (
      lowerName.includes("pytest") ||
      lowerName.includes("tox") ||
      lowerName.includes("coverage") ||
      lowerName.includes("unittest")
    ) {

      type = "test";

    }
    
    else if (
      lowerName.includes("black") ||
      lowerName.includes("flake8") ||
      lowerName.includes("mypy") ||
      lowerName.includes("pylint") ||
      lowerName.includes("isort")
    ) {

      type = "dev";
    }

    deps.push({
      name,
      version,
      ecosystem: "pip",
      type
    });
  }

  return deps;
}