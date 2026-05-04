// to store results keyed by manifest hash

const regisrtyCache = new Map<string, Record<string, string>>();

export function setRegistry(ecosystem: string, registry: Record<string, string>): void {
    regisrtyCache.set(ecosystem, registry);
} 

export function getRegistry(ecosystem: string) : Record<string, string> | undefined {
    return regisrtyCache.get(ecosystem);
}

export function clearRegistryCache() : void {
    regisrtyCache.clear();
}