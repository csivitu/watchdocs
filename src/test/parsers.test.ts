import * as assert from "assert";
import { suite, test } from "mocha";
import { parsePackageJson } from "../core/parsers/parse-package-json";
import { parseRequirementsTxt } from "../core/parsers/parse-requirements";
import { parsePyProjectToml } from "../core/parsers/parse-pyproject-toml";
import { parseUvLock } from "../core/parsers/parse-uv-lock";
import { parseGoMod } from "../core/parsers/parse-go-mod";
import { parseCargotoml } from "../core/parsers/parse-cargo-toml";
import { parsePomXml } from "../core/parsers/parse-pom-xml";
import { parsePubspecYaml } from "../core/parsers/parse-pubspec-yaml";
import { parseGemfile } from "../core/parsers/parse-gemfile";

suite("Parsers", () => {

  suite("npm — package.json", () => {
    test("parses dependencies and devDependencies", () => {
      const content = `{
  "dependencies": { "react": "^18.2.0", "next": "14.1.0" },
  "devDependencies": { "eslint": "^9.0.0" }
}`;
      const result = parsePackageJson(content);
      assert.strictEqual(result.length, 3);
      assert.strictEqual(result[0].name, "react");
      assert.strictEqual(result[0].type, "prod");
      assert.strictEqual(result[2].name, "eslint");
      assert.strictEqual(result[2].type, "dev");
    });

    test("handles empty content", () => {
      const result = parsePackageJson("");
      assert.strictEqual(result.length, 0);
    });
  });

  suite("pip — requirements.txt", () => {
    test("parses with and without version", () => {
      const content = `flask==2.3.0
pandas
# comment
`;
      const result = parseRequirementsTxt(content);
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].name, "flask");
      assert.strictEqual(result[0].version, "2.3.0");
      assert.strictEqual(result[1].name, "pandas");
      assert.strictEqual(result[1].version, "unknown");
    });

    test("classifies test and dev packages", () => {
      const content = `pytest==8.0.0
black==24.0.0
requests
`;
      const result = parseRequirementsTxt(content);
      assert.strictEqual(result[0].type, "test");
      assert.strictEqual(result[1].type, "dev");
      assert.strictEqual(result[2].type, "prod");
    });
  });

  suite("pip — pyproject.toml", () => {
    test("parses poetry dependencies", () => {
      const content = `[tool.poetry.dependencies]
python = "^3.10"
flask = "^3.0.0"

[tool.poetry.dev-dependencies]
pytest = "^8.0.0"
`;
      const result = parsePyProjectToml(content);
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].name, "flask");
      assert.strictEqual(result[0].type, "prod");
      assert.strictEqual(result[1].name, "pytest");
      assert.strictEqual(result[1].type, "dev");
    });

    test("parses project dependencies array", () => {
      const content = `[project]
dependencies = [
  "flask>=3.0.0",
  "click"
]
`;
      const result = parsePyProjectToml(content);
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].name, "flask");
    });

    test("parses optional-dependencies", () => {
      const content = `[project.optional-dependencies.tests]
pytest = "^8.0.0"
coverage = "^7.0.0"
`;
      const result = parsePyProjectToml(content);
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].type, "test");
    });
  });

  suite("pip — uv.lock", () => {
    test("parses packages from lockfile", () => {
      const content = `version = 1
requires-python = ">=3.10"

[[package]]
name = "flask"
version = "3.1.2"
source = { registry = "https://pypi.org/simple" }

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

    test("handles empty content", () => {
      const result = parseUvLock("");
      assert.strictEqual(result.length, 0);
    });

    test("handles file without packages", () => {
      const content = `version = 1
requires-python = ">=3.10"
`;
      const result = parseUvLock(content);
      assert.strictEqual(result.length, 0);
    });
  });

  suite("Go — go.mod", () => {
    test("parses single require line", () => {
      const content = `module example.com/app
go 1.21
require github.com/gin-gonic/gin v1.9.0
`;
      const result = parseGoMod(content);
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].name, "github.com/gin-gonic/gin");
      assert.strictEqual(result[0].version, "v1.9.0");
      assert.strictEqual(result[0].ecosystem, "go");
    });

    test("parses require block", () => {
      const content = `require (
	github.com/gin-gonic/gin v1.9.0
	github.com/google/uuid v1.6.0
	// indirect
	golang.org/x/net v0.20.0
)`;
      const result = parseGoMod(content);
      assert.strictEqual(result.length, 3);
      assert.strictEqual(result[0].name, "github.com/gin-gonic/gin");
    });

    test("handles empty content", () => {
      const result = parseGoMod("");
      assert.strictEqual(result.length, 0);
    });
  });

  suite("Rust — Cargo.toml", () => {
    test("parses all dependency sections", () => {
      const content = `[dependencies]
serde = "1.0"

[dev-dependencies]
criterion = "0.5"

[test-dependencies]
rstest = "0.18"
`;
      const result = parseCargotoml(content);
      assert.strictEqual(result.length, 3);
      assert.strictEqual(result[0].name, "serde");
      assert.strictEqual(result[0].ecosystem, "cargo");
      assert.strictEqual(result[0].type, "prod");
      assert.strictEqual(result[1].type, "dev");
      assert.strictEqual(result[2].type, "test");
    });

    test("handles empty content", () => {
      const result = parseCargotoml("");
      assert.strictEqual(result.length, 0);
    });
  });

  suite("Maven — pom.xml", () => {
    test("parses dependencies with scope", () => {
      const content = `<project>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
      <version>3.2.0</version>
    </dependency>
    <dependency>
      <groupId>junit</groupId>
      <artifactId>junit</artifactId>
      <version>4.13.2</version>
      <scope>test</scope>
    </dependency>
  </dependencies>
</project>`;
      const result = parsePomXml(content);
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].name, "org.springframework.boot:spring-boot-starter-web");
      assert.strictEqual(result[0].ecosystem, "maven");
      assert.strictEqual(result[0].type, "prod");
      assert.strictEqual(result[1].type, "test");
    });

    test("skips property variable versions", () => {
      const content = `<project>
  <dependencies>
    <dependency>
      <groupId>com.example</groupId>
      <artifactId>lib</artifactId>
      <version>\${some.version}</version>
    </dependency>
  </dependencies>
</project>`;
      const result = parsePomXml(content);
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].version, null);
    });
  });

  suite("Dart — pubspec.yaml", () => {
    test("parses dependencies and dev_dependencies", () => {
      const content = `dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  mockito: ^5.4.0
`;
      const result = parsePubspecYaml(content);
      assert.strictEqual(result.length, 3);
      assert.strictEqual(result[0].name, "http");
      assert.strictEqual(result[0].ecosystem, "pub");
      assert.strictEqual(result[0].type, "prod");
      assert.strictEqual(result[2].name, "mockito");
      assert.strictEqual(result[2].type, "dev");
    });

    test("handles empty content", () => {
      const result = parsePubspecYaml("");
      assert.strictEqual(result.length, 0);
    });
  });

  suite("Ruby — Gemfile", () => {
    test("parses gems with groups", () => {
      const content = `gem "rails"
gem "pg"

group :development do
  gem "rubocop"
end

group :test do
  gem "rspec"
end
`;
      const result = parseGemfile(content);
      assert.strictEqual(result.length, 4);
      assert.strictEqual(result[0].name, "rails");
      assert.strictEqual(result[0].ecosystem, "bundler");
      assert.strictEqual(result[0].type, "prod");
      assert.strictEqual(result[2].name, "rubocop");
      assert.strictEqual(result[2].type, "dev");
      assert.strictEqual(result[3].name, "rspec");
      assert.strictEqual(result[3].type, "test");
    });

    test("handles empty content", () => {
      const result = parseGemfile("");
      assert.strictEqual(result.length, 0);
    });
  });

});
