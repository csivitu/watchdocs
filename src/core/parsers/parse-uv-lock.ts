import { Dependency } from "../../models";

function classify(name: string): "prod" | "dev" | "test" {
  const lower = name.toLowerCase();

  if (
    lower.includes("pytest") ||
    lower.includes("tox") ||
    lower.includes("coverage") ||
    lower.includes("unittest")
  ) {
    return "test";
  }

  if (
    lower.includes("black") ||
    lower.includes("flake8") ||
    lower.includes("mypy") ||
    lower.includes("pylint") ||
    lower.includes("isort") ||
    lower.includes("ruff") ||
    lower.includes("pre-commit")
  ) {
    return "dev";
  }

  return "prod";
}

export function parseUvLock(content: string): Dependency[] {
  if (!content.trim()) {
    return [];
  }

  const deps: Dependency[] = [];
  const lines = content.split("\n");

  let inPackage = false;
  let name = "";
  let version = "unknown";

  function flush() {
    if (inPackage && name) {
      deps.push({
        name,
        version,
        ecosystem: "pip",
        type: classify(name)
      });
    }
    inPackage = false;
    name = "";
    version = "unknown";
  }

  for (const raw of lines) {
    const line = raw.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    if (line === "[[package]]") {
      flush();
      inPackage = true;
      continue;
    }

    if (line.startsWith("[") && !line.startsWith("[[")) {
      flush();
      continue;
    }

    if (inPackage) {
      const nameMatch = line.match(/^name\s*=\s*"([^"]+)"/);
      if (nameMatch) {
        name = nameMatch[1];
        continue;
      }

      const versionMatch = line.match(/^version\s*=\s*"([^"]+)"/);
      if (versionMatch) {
        version = versionMatch[1];
        continue;
      }
    }
  }

  flush();

  return deps;
}
