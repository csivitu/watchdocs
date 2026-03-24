"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRequirementsTxt = parseRequirementsTxt;
function parseRequirementsTxt(content) {
    if (!content.trim())
        return [];
    var lines = content.split("\n");
    var deps = [];
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        var trimmed = line.trim();
        if (!trimmed)
            continue;
        var parts = trimmed.split("==");
        deps.push({
            name: parts[0],
            version: parts[1] || "unknown",
            ecosystem: "pip"
        });
    }
    return deps;
}
