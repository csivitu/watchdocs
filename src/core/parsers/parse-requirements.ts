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

    let name = trimmed;
    let version = "unknown";

    for (const op of operators) {

      if (trimmed.includes(op)) {

        const parts =
          trimmed.split(op);

        name = parts[0].trim();
        version = parts[1].trim();

        break;
      }
    }

    
    let type: "prod" | "dev" | "test" =
      "prod";

    name = name.replace(/\[.*\]/, "");

    const lowerName =
      name.toLowerCase();

    
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