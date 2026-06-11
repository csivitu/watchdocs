import * as assert from "assert";
import { suite, test } from "mocha";
import { detectImport } from "../core/import-detector";

suite("Import Detection", () => {

  suite("JavaScript / TypeScript", () => {
    test("detects import from", () => {
      const r = detectImport(`import React from "react"`, "typescript");
      assert.ok(r);
      assert.strictEqual(r.name, "react");
      assert.strictEqual(r.ecosystem, "npm");
    });

    test("detects require", () => {
      const r = detectImport(`const fs = require("fs-extra")`, "javascript");
      assert.ok(r);
      assert.strictEqual(r.name, "fs-extra");
    });

    test("detects scoped package", () => {
      const r = detectImport(`import pkg from "@babel/core"`, "typescript");
      assert.ok(r);
      assert.strictEqual(r.name, "@babel/core");
    });

    test("returns null for relative imports", () => {
      const r = detectImport(`import utils from "./utils"`, "typescript");
      assert.strictEqual(r, null);
    });
  });

  suite("Python", () => {
    test("detects import statement", () => {
      const r = detectImport(`import flask`, "python");
      assert.ok(r);
      assert.strictEqual(r.name, "flask");
      assert.strictEqual(r.ecosystem, "pip");
    });

    test("detects from import", () => {
      const r = detectImport(`from flask import Flask`, "python");
      assert.ok(r);
      assert.strictEqual(r.name, "flask");
    });

    test("ignores comment line", () => {
      const r = detectImport(`# import flask`, "python");
      assert.strictEqual(r, null);
    });
  });

  suite("Go", () => {
    test("detects single-line import", () => {
      const r = detectImport(`import "github.com/gin-gonic/gin"`, "go");
      assert.ok(r);
      assert.strictEqual(r.name, "github.com/gin-gonic/gin");
      assert.strictEqual(r.ecosystem, "go");
    });

    test("detects block import line", () => {
      const r = detectImport(`	"github.com/google/uuid"`, "go");
      assert.ok(r);
      assert.strictEqual(r.name, "github.com/google/uuid");
    });
  });

  suite("Rust", () => {
    test("detects use statement", () => {
      const r = detectImport(`use serde::Deserialize`, "rust");
      assert.ok(r);
      assert.strictEqual(r.name, "serde");
      assert.strictEqual(r.ecosystem, "cargo");
    });
  });

  suite("Java / Kotlin", () => {
    test("detects import with class", () => {
      const r = detectImport(`import org.springframework.boot.SpringApplication`, "java");
      assert.ok(r);
      assert.strictEqual(r.name, "org.springframework.boot");
      assert.strictEqual(r.ecosystem, "maven");
    });

    test("detects import without class", () => {
      const r = detectImport(`import java.util.*`, "java");
      assert.ok(r);
      assert.strictEqual(r.name, "java.util.");
    });
  });

  suite("Dart", () => {
    test("detects package import", () => {
      const r = detectImport(`import 'package:http/http.dart'`, "dart");
      assert.ok(r);
      assert.strictEqual(r.name, "http");
      assert.strictEqual(r.ecosystem, "pub");
    });

    test("returns null for non-package import", () => {
      const r = detectImport(`import 'dart:io'`, "dart");
      assert.strictEqual(r, null);
    });
  });

  suite("Ruby", () => {
    test("detects require", () => {
      const r = detectImport(`require "sinatra"`, "ruby");
      assert.ok(r);
      assert.strictEqual(r.name, "sinatra");
      assert.strictEqual(r.ecosystem, "bundler");
    });

    test("detects gem statement", () => {
      const r = detectImport(`gem "sinatra"`, "ruby");
      assert.ok(r);
      assert.strictEqual(r.name, "sinatra");
    });

    test("returns null for non-import line", () => {
      const r = detectImport(`puts "hello"`, "ruby");
      assert.strictEqual(r, null);
    });
  });

  suite("Unknown language", () => {
    test("returns null", () => {
      const r = detectImport(`import something`, "cobol");
      assert.strictEqual(r, null);
    });
  });

});
