import * as assert from "assert";
import * as vscode from "vscode";
import { readFile } from "../core/reader/reader";
import { parsePackageJson } from "../core/parsers/parse-package-json";

suite("Extension", () => {

  test("extension is present", () => {
    const ext = vscode.extensions.getExtension("watchdocs.watchdocs");
    assert.ok(ext);
  });

  test("commands are registered", async () => {
    const commands = await vscode.commands.getCommands();
    assert.ok(commands.includes("watchdocs.scan"));
    assert.ok(commands.includes("watchdocs.search"));
    assert.ok(commands.includes("watchdocs.exportDependencies"));
  });

  test("can read and parse a file", async () => {
    const files = await vscode.workspace.findFiles("package.json", "**/node_modules/**", 1);
    if (files.length > 0) {
      const content = await readFile(files[0]);
      const deps = parsePackageJson(content);
      assert.ok(Array.isArray(deps));
    }
  });

});
