import * as assert from "assert";
import { suite, test, teardown } from "mocha";
import { onlineNpmResolver } from "../core/resolver/online-npm-resolver";
import { onlinePipResolver } from "../core/resolver/online-pip-resolver";
import { onlineGoResolver } from "../core/resolver/online-go-resolver";
import { onlineCargoResolver } from "../core/resolver/online-cargo-resolver";
import { onlineMavenResolver } from "../core/resolver/online-maven-resolver";
import { onlinePubResolver } from "../core/resolver/online-pub-resolver";
import { onlineBundlerResolver } from "../core/resolver/online-bundler-resolver";
import { Dependency } from "../models";

suite("Online Resolvers", () => {
  const originalFetch = globalThis.fetch;

  teardown(() => {
    globalThis.fetch = originalFetch;
  });

  function mockResponse(ok: boolean, json: unknown) {
    globalThis.fetch = (async () => {
      return { ok, json: async () => json } as Response;
    }) as typeof fetch;
  }

  function mockError() {
    globalThis.fetch = (async () => {
      throw new Error("network error");
    }) as typeof fetch;
  }

  suite("npm", () => {
    const dep: Dependency = { name: "react", version: "18.2.0", ecosystem: "npm" };

    test("resolves homepage", async () => {
      mockResponse(true, { homepage: "https://react.dev" });
      const result = await onlineNpmResolver(dep);
      assert.ok(result);
      assert.strictEqual(result?.docUrl, "https://react.dev");
      assert.strictEqual(result?.source, "online-registry");
    });

    test("returns null on non-ok response", async () => {
      mockResponse(false, {});
      const result = await onlineNpmResolver(dep);
      assert.strictEqual(result, null);
    });

    test("returns null on network error", async () => {
      mockError();
      const result = await onlineNpmResolver(dep);
      assert.strictEqual(result, null);
    });
  });

  suite("pip", () => {
    const dep: Dependency = { name: "Requests", version: "2.32.0", ecosystem: "pip" };

    test("prefers Documentation url", async () => {
      mockResponse(true, {
        info: {
          project_urls: {
            Documentation: "https://requests.readthedocs.io/",
            Homepage: "https://example.com/home"
          },
          home_page: "https://example.com/legacy"
        }
      });
      const result = await onlinePipResolver(dep);
      assert.ok(result);
      assert.strictEqual(result?.docUrl, "https://requests.readthedocs.io/");
    });

    test("falls back to home_page", async () => {
      mockResponse(true, {
        info: { home_page: "https://pypi.org/project/requests/" }
      });
      const result = await onlinePipResolver(dep);
      assert.ok(result);
      assert.strictEqual(result?.docUrl, "https://pypi.org/project/requests/");
    });

    test("returns null on non-ok response", async () => {
      mockResponse(false, {});
      const result = await onlinePipResolver(dep);
      assert.strictEqual(result, null);
    });

    test("returns null on network error", async () => {
      mockError();
      const result = await onlinePipResolver(dep);
      assert.strictEqual(result, null);
    });
  });

  suite("go", () => {
    const dep: Dependency = { name: "github.com/gin-gonic/gin", version: "v1.9.0", ecosystem: "go" };

    test("constructs versioned pkg.go.dev url", async () => {
      mockResponse(true, {});
      const result = await onlineGoResolver(dep);
      assert.ok(result);
      assert.strictEqual(result?.docUrl, "https://pkg.go.dev/github.com/gin-gonic/gin@v1.9.0");
    });

    test("constructs unversioned url when version is null", async () => {
      mockResponse(true, {});
      const result = await onlineGoResolver({ ...dep, version: null });
      assert.ok(result);
      assert.strictEqual(result?.docUrl, "https://pkg.go.dev/github.com/gin-gonic/gin");
    });

    test("returns null on network error", async () => {
      mockError();
      const result = await onlineGoResolver(dep);
      assert.strictEqual(result, null);
    });
  });

  suite("cargo", () => {
    const dep: Dependency = { name: "serde", version: "1.0.0", ecosystem: "cargo" };

    test("resolves documentation_url from crates.io", async () => {
      mockResponse(true, { crate: { documentation: "https://serde.rs" } });
      const result = await onlineCargoResolver(dep);
      assert.ok(result);
      assert.strictEqual(result?.docUrl, "https://serde.rs");
    });

    test("returns null on non-ok response", async () => {
      mockResponse(false, {});
      const result = await onlineCargoResolver(dep);
      assert.strictEqual(result, null);
    });

    test("returns null on network error", async () => {
      mockError();
      const result = await onlineCargoResolver(dep);
      assert.strictEqual(result, null);
    });
  });

  suite("maven", () => {
    const dep: Dependency = { name: "org.springframework.boot:spring-boot-starter-web", version: "3.2.0", ecosystem: "maven" };

    test("resolves from Maven Central", async () => {
      mockResponse(true, { response: { docs: [{ g: "org.springframework.boot", a: "spring-boot-starter-web" }] } });
      const result = await onlineMavenResolver(dep);
      assert.ok(result);
      assert.ok(result?.docUrl?.includes("spring-boot-starter-web"));
    });

    test("returns null on non-ok response", async () => {
      mockResponse(false, {});
      const result = await onlineMavenResolver(dep);
      assert.strictEqual(result, null);
    });

    test("returns null on network error", async () => {
      mockError();
      const result = await onlineMavenResolver(dep);
      assert.strictEqual(result, null);
    });
  });

  suite("pub", () => {
    const dep: Dependency = { name: "http", version: "1.2.0", ecosystem: "pub" };

    test("resolves documentation from pub.dev", async () => {
      mockResponse(true, { latest: { pubspec: { homepage: "https://pub.dev/packages/http" } } });
      const result = await onlinePubResolver(dep);
      assert.ok(result);
      assert.ok(result?.docUrl);
    });

    test("returns null on non-ok response", async () => {
      mockResponse(false, {});
      const result = await onlinePubResolver(dep);
      assert.strictEqual(result, null);
    });

    test("returns null on network error", async () => {
      mockError();
      const result = await onlinePubResolver(dep);
      assert.strictEqual(result, null);
    });
  });

  suite("bundler", () => {
    const dep: Dependency = { name: "sinatra", version: "4.0.0", ecosystem: "bundler" };

    test("prefers documentation_uri", async () => {
      mockResponse(true, {
        documentation_uri: "https://sinatrarb.com",
        homepage_uri: "https://example.com/home",
        source_code_uri: "https://github.com/sinatra/sinatra",
        version: "4.0.0"
      });
      const result = await onlineBundlerResolver(dep);
      assert.ok(result);
      assert.strictEqual(result?.docUrl, "https://sinatrarb.com");
    });

    test("falls back to gem page url", async () => {
      mockResponse(true, { version: "4.0.0" });
      const result = await onlineBundlerResolver(dep);
      assert.ok(result);
      assert.strictEqual(result?.docUrl, "https://rubygems.org/gems/sinatra");
    });

    test("returns null on network error", async () => {
      mockError();
      const result = await onlineBundlerResolver(dep);
      assert.strictEqual(result, null);
    });
  });

});
