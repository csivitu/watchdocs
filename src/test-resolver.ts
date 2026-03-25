import "dotenv/config";
import { GeminiResolver } from "./core/resolver/doc-resolver";

const testDeps = [
  { name: "next", version: "14.1.0", ecosystem: "npm" },
  { name: "react", version: "18.0.0", ecosystem: "npm" },
  { name: "typescript", version: "5.0.0", ecosystem: "npm" },
];

async function main() {
  const resolver = new GeminiResolver();

  console.log("Resolving docs for:", testDeps);
  console.log("---");

  const results = await resolver.resolve(testDeps);

  console.log("Results:");
  results.forEach((r) => {
    console.log(`📦 ${r.name}@${r.version}`);
    console.log(`   URL: ${r.docUrl ?? "unknown"}`);
    console.log(`   Source: ${r.source}`);
    console.log();
  });
}

main().catch(console.error);