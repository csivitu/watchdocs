import * as assert from "assert";
import { parsePackageJson } from "../core/parsers/parse-package-json";
import { parseRequirementsTxt } from "../core/parsers/parse-requirements";

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

});