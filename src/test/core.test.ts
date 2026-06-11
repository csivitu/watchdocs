import * as assert from "assert";
import { setScanResults, getCached, addToCache, clearCache } from "../core/cache/doc-cache";
import { deduplicateDeps } from "../core/dedup";
import { Dependency, DocResult } from "../models";

suite("Core", () => {

  suite("doc-cache", () => {

    teardown(() => {
      clearCache();
    });

    test("returns undefined for missing key", () => {
      const result = getCached("npm", "react");
      assert.strictEqual(result, undefined);
    });

    test("stores and retrieves result", () => {
      const doc: DocResult = { name: "react", version: "18.2.0", docUrl: "https://react.dev", ecosystem: "npm", source: "registry" };
      addToCache("npm", "react", doc);
      const result = getCached("npm", "react");
      assert.ok(result);
      assert.strictEqual(result?.docUrl, "https://react.dev");
    });

    test("overwrites by key", () => {
      const first: DocResult = { name: "flask", version: "2.0.0", docUrl: "https://a.com", ecosystem: "pip", source: "registry" };
      const second: DocResult = { name: "flask", version: "3.0.0", docUrl: "https://b.com", ecosystem: "pip", source: "registry" };
      addToCache("pip", "flask", first);
      addToCache("pip", "flask", second);
      const result = getCached("pip", "flask");
      assert.strictEqual(result?.docUrl, "https://b.com");
    });

    test("setScanResults populates cache", () => {
      const results: DocResult[] = [
        { name: "react", version: "18.0.0", docUrl: "https://react.dev", ecosystem: "npm", source: "registry" },
        { name: "vue", version: "3.0.0", docUrl: null, ecosystem: "npm", source: "unknown" }
      ];
      setScanResults(results);
      assert.ok(getCached("npm", "react"));
      assert.strictEqual(getCached("npm", "vue"), undefined);
    });

    test("clearCache empties the cache", () => {
      const doc: DocResult = { name: "lodash", version: "4.0.0", docUrl: "https://lodash.com", ecosystem: "npm", source: "registry" };
      addToCache("npm", "lodash", doc);
      clearCache();
      assert.strictEqual(getCached("npm", "lodash"), undefined);
    });
  });

  suite("dedup", () => {
    test("removes duplicates by ecosystem:name", () => {
      const deps: Dependency[] = [
        { name: "flask", version: "3.1.2", ecosystem: "pip" },
        { name: "flask", version: "3.1.2", ecosystem: "pip" },
        { name: "react", version: "18.0.0", ecosystem: "npm" }
      ];
      const result = deduplicateDeps(deps);
      assert.strictEqual(result.length, 2);
    });

    test("prefers known version over unknown", () => {
      const deps: Dependency[] = [
        { name: "flask", version: "unknown", ecosystem: "pip" },
        { name: "flask", version: "3.1.2", ecosystem: "pip" }
      ];
      const result = deduplicateDeps(deps);
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].version, "3.1.2");
    });

    test("keeps distinct ecosystems separate", () => {
      const deps: Dependency[] = [
        { name: "requests", version: "2.0.0", ecosystem: "pip" },
        { name: "requests", version: "1.0.0", ecosystem: "npm" }
      ];
      const result = deduplicateDeps(deps);
      assert.strictEqual(result.length, 2);
    });

    test("handles empty array", () => {
      const result = deduplicateDeps([]);
      assert.strictEqual(result.length, 0);
    });

    test("keeps first entry when all versions are unknown", () => {
      const deps: Dependency[] = [
        { name: "flask", version: "unknown", ecosystem: "pip" },
        { name: "flask", version: "unknown", ecosystem: "pip" }
      ];
      const result = deduplicateDeps(deps);
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].version, "unknown");
    });
  });

});
