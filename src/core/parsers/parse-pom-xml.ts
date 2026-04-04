import { Dependency } from "../../models"

export function parsePomXml(content: string): Dependency[] {
  if (!content.trim()) return []

  const deps: Dependency[] = []
  // simple regex to find dependency blocks without needing a full XML parser module
  const dependencyRegex = /<dependency>([\s\S]*?)<\/dependency>/gi
  const artifactIdRegex = /<artifactId>\s*(.*?)\s*<\/artifactId>/i
  const versionRegex = /<version>\s*(.*?)\s*<\/version>/i

  let match;
  while ((match = dependencyRegex.exec(content)) !== null) {
    const block = match[1]
    const artifactMatch = block.match(artifactIdRegex)
    if (artifactMatch) {
      const name = artifactMatch[1]
      const versionMatch = block.match(versionRegex)
      let version: string | null = versionMatch ? versionMatch[1] : null
      
      // ignore internal property placeholder versions like ${spring.version}
      if (version && version.startsWith("${")) {
         version = null
      }
      
      deps.push({ name, version, ecosystem: "maven" })
    }
  }

  return deps
}
