import { Uri } from 'vscode';

export type Dependency = {
  name: string
  version: string | null
  ecosystem: string
  type?: "prod" | "dev" | "test";
}

export type DocResult = {
  name: string
  version: string | null
  docUrl: string | null
  source: "registry" | "llm" | "unknown" | "online-registry"
  type?: "prod" | "dev" | "test";
}

export interface DocResolver {
  resolve(deps: Dependency[]): Promise<DocResult[]>
}

export interface ManifestFile {
  uri: Uri
  type: "pip" | "npm" | "go" | "cargo" | "maven" | "pub" | "bundler" | "nuget" | "unknown"
}