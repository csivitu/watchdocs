// to store results keyed by manifest hash

const registryCache = new Map<string, Record<string, string>>();

export function setRegistry(ecosystem: string, registry: Record<string, string>): void {
    registryCache.set(ecosystem, registry);
} 

export function getRegistry(ecosystem: string) : Record<string, string> | undefined {
    return registryCache.get(ecosystem);
}

export function clearRegistryCache() : void {
    registryCache.clear();
}