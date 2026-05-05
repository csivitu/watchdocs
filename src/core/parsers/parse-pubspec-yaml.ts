import { Dependency } from "../../models";

export function parsePubspecYaml(content: string): Dependency[] {
  if (!content.trim()) {return [];}

  const lines = content.split("\n");
  const deps: Dependency[] = [];
  let inDependenciesBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith("#") || !trimmed) {continue;}

    const matchTopLevel = line.match(/^([a-zA-Z0-9_-]+):/);
    if (matchTopLevel) {
      const blockName = matchTopLevel[1];
      if (blockName === "dependencies" || blockName === "dev_dependencies") {
        inDependenciesBlock = true;
      } else {
        inDependenciesBlock = false;
      }
      continue;
    }

    if (inDependenciesBlock) {
      // Must be indented
      if (line.startsWith(" ") || line.startsWith("\t")) {
        const depMatch = line.match(/^\s+([a-zA-Z0-9_.-]+):(.*)/);
        if (depMatch) {
          const name = depMatch[1];
          let version: string | null = depMatch[2].trim();
          
          if (version === "" || version === "any" || version.startsWith("{")) {
            version = null; 
          } else {
             // Remove wrapping quotes if any
             version = version.replace(/['"]/g, "");
          }
          
          if (name !== 'flutter' && name !== 'sdk') {
             if (!deps.find(d => d.name === name)) {
                deps.push({ name, version, ecosystem: "pub" });
             }
          }
        }
      }
    }
  }

  return deps;
}
