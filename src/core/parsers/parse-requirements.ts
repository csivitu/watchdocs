import { Dependency } from "../../models"

export function parseRequirementsTxt(content: string): Dependency[] {
  if (!content.trim()) return []

  const lines = content.split("\n")
  const deps: Dependency[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const parts = trimmed.split("==")

    deps.push({
      name: parts[0],
      version: parts[1] || "unknown",
      ecosystem: "pip"
    })
  }

  return deps
}