"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const parse_package_json_1 = require("../core/parsers/parse-package-json");
const parse_requirements_1 = require("../core/parsers/parse-requirements");
suite("Parser Tests", () => {
    test("Parse package.json dependencies", () => {
        const content = `
    {
      "dependencies": {
        "react": "^18.2.0",
        "next": "14.1.0"
      }
    }`;
        const result = (0, parse_package_json_1.parsePackageJson)(content);
        assert.strictEqual(result.length, 2);
        assert.strictEqual(result[0].name, "react");
    });
    test("Handle empty package.json", () => {
        const result = (0, parse_package_json_1.parsePackageJson)("");
        assert.strictEqual(result.length, 0);
    });
    test("Parse requirements.txt", () => {
        const content = `
    flask==2.3.0
    numpy==1.26.0
    pandas
    `;
        const result = (0, parse_requirements_1.parseRequirementsTxt)(content);
        assert.strictEqual(result.length, 3);
        assert.strictEqual(result[2].version, "unknown");
    });
});
//# sourceMappingURL=parser.test.js.map