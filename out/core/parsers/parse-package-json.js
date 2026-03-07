"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePackageJson = parsePackageJson;
function parsePackageJson(content) {
    if (!content.trim())
        return [];
    try {
        const data = JSON.parse(content);
        const dependencies = data.dependencies || {};
        const result = [];
        for (const name in dependencies) {
            result.push({
                name,
                version: dependencies[name] || "unknown",
                ecosystem: "npm"
            });
        }
        return result;
    }
    catch {
        return [];
    }
}
//# sourceMappingURL=parse-package-json.js.map