import { Dependency } from "../../models"

export function parsePackageJson(content: string): Dependency[] {
  if (!content.trim()) return []

  try {
    const data = JSON.parse(content)

    const dependencies = data.dependencies || {}
    const result: Dependency[] = []

    for (const name in dependencies) {
      result.push({
        name,
        version: dependencies[name] || "unknown",
        ecosystem: "npm"
      })
    }

    return result
  } catch {
    return []
  }
}