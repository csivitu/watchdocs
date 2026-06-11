import { Dependency } from "../../models";

export function parsePubspecYaml(content: string): Dependency[] {

  if (!content.trim()) {
    return [];
  }

  const lines = content.split("\n");
  const deps: Dependency[] = [];

  let currentType: "prod" | "dev" | "test" | null =
    null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const trimmed = line.trim();

    if (trimmed.startsWith("#") ||!trimmed) {
      continue;
    }


    const matchTopLevel =line.match(/^([a-zA-Z0-9_-]+):/);

    if (matchTopLevel) {
      
      const blockName =
        matchTopLevel[1];

      if (blockName === "dependencies") {

        currentType = "prod";

      } else if (
        blockName === "dev_dependencies"
      ) {

        currentType = "dev";

      } else {

        currentType = null;
      }

      continue;
    }


    if (currentType) {

      
      if (line.startsWith(" ") ||line.startsWith("\t")) {

        const depMatch = line.match(/^\s+([a-zA-Z0-9_.-]+):(.*)/);

        if (depMatch) {

          const name = depMatch[1];

          let version: string | null =depMatch[2].trim();

          if (
            version === "" ||
            version === "any" ||
            version.startsWith("{")
          ) {

            version = null;

          } else {

            version = version.replace(
              /['"]/g,
              ""
            );
          }

          
          if (
            name === "flutter" ||
            name === "sdk"
          ) { continue; }

          if (!version) {
            const nextLine = (lines[i + 1] || "").trim();
            if (nextLine.startsWith("sdk:")) { continue; }
          }

          if (
              !deps.find(
                d => d.name === name
              )
            ) {

              deps.push({
                name,
                version,
                ecosystem: "pub",
                type: currentType
              });

            }
          }
        }
    }
  }

  return deps;
}