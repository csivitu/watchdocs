"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePackageJson = parsePackageJson;
function parsePackageJson(content) {
    if (!content.trim())
        return [];
    try {
        var data = JSON.parse(content);
        var dependencies = data.dependencies || {};
        var result = [];
        for (var name_1 in dependencies) {
            result.push({
                name: name_1,
                version: dependencies[name_1] || "unknown",
                ecosystem: "npm"
            });
        }
        return result;
    }
    catch (_a) {
        return [];
    }
}
