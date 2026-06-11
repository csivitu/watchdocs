import * as assert from "assert";
import { parsePackageJson } from "../core/parsers/parse-package-json";
import { parseRequirementsTxt } from "../core/parsers/parse-requirements";
import { parseUvLock } from "../core/parsers/parse-uv-lock";

suite("Parser Tests", () => {

  test("Parse package.json dependencies", () => {
    const content = `
    {
      "dependencies": {
        "react": "^18.2.0",
        "next": "14.1.0"
      }
    }`;

    const result = parsePackageJson(content);

    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].name, "react");
  });

  test("Handle empty package.json", () => {
    const result = parsePackageJson("");
    assert.strictEqual(result.length, 0);
  });

  test("Parse requirements.txt", () => {
    const content = `
    flask==2.3.0
    numpy==1.26.0
    pandas
    `;

    const result = parseRequirementsTxt(content);

    assert.strictEqual(result.length, 3);
    assert.strictEqual(result[2].version, "unknown");
  });

  test("Parse uv.lock dependencies", () => {
    const content = `
version = 1
requires-python = ">=3.10"

[[package]]
name = "flask"
version = "3.1.2"
source = { registry = "https://pypi.org/simple" }
sdist = { url = "https://files.pythonhosted.org/...", hash = "sha256:..." }

[[package]]
name = "pytest"
version = "8.5.1"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "ruff"
version = "0.11.0"
source = { registry = "https://pypi.org/simple" }
`;

    const result = parseUvLock(content);

    assert.strictEqual(result.length, 3);
    assert.strictEqual(result[0].name, "flask");
    assert.strictEqual(result[0].version, "3.1.2");
    assert.strictEqual(result[0].ecosystem, "pip");
    assert.strictEqual(result[0].type, "prod");
    assert.strictEqual(result[1].type, "test");
    assert.strictEqual(result[2].type, "dev");
  });

  test("Handle empty uv.lock", () => {
    const result = parseUvLock("");
    assert.strictEqual(result.length, 0);
  });

  test("Handle uv.lock without packages", () => {
    const content = `
version = 1
requires-python = ">=3.10"
`;

    const result = parseUvLock(content);
    assert.strictEqual(result.length, 0);
  });

});