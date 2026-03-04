export type Dependency = {
  name: string
  version: string | null
  ecosystem: string
}

export type DocResult = {
  name: string
  version: string | null
  docUrl: string | null
  source: "registry" | "llm" | "unknown"
}

export interface DocResolver {
  resolve(deps: Dependency[]): Promise<DocResult[]>
}