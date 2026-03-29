import { GeminiResolver } from "./core/resolver/gemini-resolver";
import * as vscode from "vscode";

const testDeps = [
  { name: "next", version: "14.1.0", ecosystem: "npm" },
  { name: "react", version: "18.0.0", ecosystem: "npm" },
  { name: "typescript", version: "5.0.0", ecosystem: "npm" },
];

async function main() {
  // Mock context for testing outside VS Code
  const mockContext = {
    secrets: {
      get: async () => process.env.GEMINI_API_KEY,
      store: async () => {},
      delete: async () => {}
    }
  } as unknown as vscode.ExtensionContext;

  const resolver = new GeminiResolver(mockContext);

  console.log("Resolving docs for:", testDeps);
  console.log("---");

  const results = await resolver.resolve(testDeps);

  console.log("Results:");
  results.forEach((r: any) => {
    console.log(`📦 ${r.name}@${r.version}`);
    console.log(`   URL: ${r.docUrl ?? "unknown"}`);
    console.log(`   Source: ${r.source}`);
    console.log();
  });
}

main().catch(console.error);