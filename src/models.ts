import { Uri } from 'vscode';

export type Ecosystem = "npm" | "pip" | "go" | "cargo" | "maven" | "pub" | "bundler";

export type Dependency = {
  name: string
  version: string | null
  ecosystem: Ecosystem
  type?: "prod" | "dev" | "test";
}

export type DocResult = {
  name: string
  version: string | null
  docUrl: string | null
  ecosystem: string
  source: "registry" | "unknown" | "online-registry"
  type?: "prod" | "dev" | "test";
}

export interface DocResolver {
  resolve(deps: Dependency[]): Promise<DocResult[]>
}

export interface ManifestFile {
  uri: Uri
  type: "pip" | "npm" | "go" | "cargo" | "maven" | "pub" | "bundler" | "unknown"
}