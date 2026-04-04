import { Dependency } from "../../models"

export function parseCargotoml(content: string): Dependency[] {
  if (!content.trim()) return []

  const lines = content.split("\n")
  const deps: Dependency[] = []
  let inDepBlock = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (trimmed === "[dependencies]") { inDepBlock = true; continue }
    if (trimmed.startsWith("[")) { inDepBlock = false; continue }

    if (inDepBlock && !trimmed.startsWith("#")) {
      const match = trimmed.match(/^(\S+)\s*=\s*"([^"]+)"/)
      if (match) {
        deps.push({ 
            name: match[1], 
            version: match[2], 
            ecosystem: "cargo" })
      }
    }
  }

  return deps
}