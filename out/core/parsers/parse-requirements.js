"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRequirementsTxt = parseRequirementsTxt;
function parseRequirementsTxt(content) {
    if (!content.trim())
        return [];
    const lines = content.split("\n");
    const deps = [];
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed)
            continue;
        const parts = trimmed.split("==");
        deps.push({
            name: parts[0],
            version: parts[1] || "unknown",
            ecosystem: "pip"
        });
    }
    return deps;
}
//# sourceMappingURL=parse-requirements.js.map