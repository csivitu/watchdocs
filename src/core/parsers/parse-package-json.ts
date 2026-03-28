import { Dependency } from "../../models"

export function parsePackageJson(content: string): Dependency[] {
  if (!content.trim()) return []

  try {
    const data = JSON.parse(content)
    const result: Dependency[] = []

    const sections = ["dependencies", "devDependencies"]
    for (const sectionName of sections) {
      const deps = data[sectionName] || {}
      for (const name in deps) {
        result.push({
          name,
          version: deps[name] || "unknown",
          ecosystem: "npm"
        })
      }
    }

    return result
  } catch {
    return []
  }
}