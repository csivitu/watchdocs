import { Dependency } from "../../models";

export function parseRequirementsTxt(content: string): Dependency[] {
  if (!content.trim()) {return [];}

  const operators = ["==", ">=", "<=", "!=", "~=", ">", "<"];
  const lines = content.split("\n");
  const deps: Dependency[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {continue;} 

    let name = trimmed;
    let version = "unknown";
    
    for (const op of operators) {
      if (trimmed.includes(op)) {
        const parts = trimmed.split(op);
        name = parts[0].trim();
        version = parts[1].trim();
        break;
      }
    }

    deps.push({
      name,
      version,
      ecosystem: "pip"
    });
  }

  return deps;
}
