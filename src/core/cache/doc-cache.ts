import { DocResult } from "../../models";

const docCache = new Map<string, DocResult | null>();

function cacheKey(ecosystem: string, name: string): string {
    return `${ecosystem}:${name}`;
}

export function setScanResults(results: DocResult[]): void {
    for (const r of results) {
        if (r.docUrl) {
            docCache.set(cacheKey(r.ecosystem, r.name), r);
        }
    }
}

export function getCached(ecosystem: string, name: string): DocResult | null | undefined {
    return docCache.get(cacheKey(ecosystem, name));
}

export function addToCache(ecosystem: string, name: string, result: DocResult | null): void {
    docCache.set(cacheKey(ecosystem, name), result);
}

export function clearCache(): void {
    docCache.clear();
}
