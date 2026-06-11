import { Dependency } from "../models";

export function deduplicateDeps(deps: Dependency[]): Dependency[] {
  const seen = new Map<string, Dependency>();
  for (const dep of deps) {
    const key = `${dep.ecosystem}:${dep.name}`;
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, dep);
    } else if (dep.version && dep.version !== "unknown" && (!existing.version || existing.version === "unknown")) {
      seen.set(key, dep);
    }
  }
  return Array.from(seen.values());
}
