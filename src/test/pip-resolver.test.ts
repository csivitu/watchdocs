import * as assert from "assert";
import { onlinePipResolver } from "../core/resolver/online-pip-resolver";
import { Dependency } from "../models";

suite("Pip Resolver Tests", () => {
    const originalFetch = globalThis.fetch;

    const dep: Dependency = {
        name: "Requests",
        version: "2.32.0",
        ecosystem: "pip"
    };

    teardown(() => {
        globalThis.fetch = originalFetch;
    });

    test("resolves from PyPI and prefers Documentation url", async () => {
        let calledUrl = "";
        globalThis.fetch = (async (input: string | URL | Request) => {
            calledUrl = String(input);
            return {
                ok: true,
                json: async () => ({
                    info: {
                        project_urls: {
                            Documentation: "https://requests.readthedocs.io/en/latest/",
                            Homepage: "https://example.com/home"
                        },
                        home_page: "https://example.com/legacy"
                    }
                })
            } as Response;
        }) as typeof fetch;

        const result = await onlinePipResolver(dep);

        assert.strictEqual(calledUrl, "https://pypi.org/pypi/requests/json");
        assert.ok(result);
        assert.strictEqual(result?.name, "Requests");
        assert.strictEqual(result?.version, "2.32.0");
        assert.strictEqual(result?.docUrl, "https://requests.readthedocs.io/en/latest/");
        assert.strictEqual(result?.source, "online-registry");
    });

    test("falls back to home_page when project_urls are missing", async () => {
        globalThis.fetch = (async () => {
            return {
                ok: true,
                json: async () => ({
                    info: {
                        home_page: "https://pypi.org/project/requests/"
                    }
                })
            } as Response;
        }) as typeof fetch;

        const result = await onlinePipResolver(dep);

        assert.ok(result);
        assert.strictEqual(result?.docUrl, "https://pypi.org/project/requests/");
    });

    test("returns null on non-ok response", async () => {
        globalThis.fetch = (async () => {
            return {
                ok: false,
                json: async () => ({})
            } as Response;
        }) as typeof fetch;

        const result = await onlinePipResolver(dep);

        assert.strictEqual(result, null);
    });

    test("returns null when fetch throws", async () => {
        globalThis.fetch = (async () => {
            throw new Error("network error");
        }) as typeof fetch;

        const result = await onlinePipResolver(dep);

        assert.strictEqual(result, null);
    });
});