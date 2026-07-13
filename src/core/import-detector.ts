import { Ecosystem } from "../models";

export function detectImport(
    line: string,
    languageId: string
): { name: string; ecosystem: Ecosystem } | null {

    switch (languageId) {

        case "javascript":
        case "typescript":
        case "javascriptreact":
        case "typescriptreact": {

            const importFrom = line.match(
                /^\s*import\s+.+?\s+from\s+['"](@?[^'"./][^'"]*)['"]/
            );

            const sideEffect = line.match(
                /^\s*import\s+['"](@?[^'"./][^'"]*)['"]/
            );

            const requireImport = line.match(
                /require\s*\(\s*['"](@?[^'"./][^'"]*)['"]\s*\)/
            );

            const pkg =
                importFrom?.[1] ||
                sideEffect?.[1] ||
                requireImport?.[1];

            return pkg
                ? { name: pkg, ecosystem: "npm" }
                : null;
        }

        case "python": {

            const importMatch = line.match(
                /^\s*import\s+([a-zA-Z0-9_]+)/
            );

            const fromMatch = line.match(
                /^\s*from\s+([a-zA-Z0-9_]+)\s+import\s+/
            );

            const pkg =
                importMatch?.[1] ||
                fromMatch?.[1];

            return pkg
                ? { name: pkg, ecosystem: "pip" }
                : null;
        }

        case "go": {

            const match = line.match(
                /^\s*import\s+(?:\w+\s+)?["']([^"']+)["']/
            ) || line.match(
                /^\s+"([^"]+)"/
            );

            return match
                ? { name: match[1], ecosystem: "go" }
                : null;
        }

        case "rust": {

            const match = line.match(
                /^\s*use\s+([a-zA-Z0-9_]+)/
            );

            return match
                ? { name: match[1], ecosystem: "cargo" }
                : null;
        }

        case "java":
        case "kotlin": {

            const match = line.match(
                /^\s*import\s+([a-zA-Z0-9_.]+)/
            );

            if (!match) {return null;}
            const parts = match[1].split(".");
            if (parts.length > 1 && /^[A-Z]/.test(parts[parts.length - 1])) {
                parts.pop();
            }
            return { name: parts.join("."), ecosystem: "maven" };
        }

        case "dart": {

            const match = line.match(
                /^\s*import\s+['"]package:([a-zA-Z0-9_]+)/
            );

            return match
                ? { name: match[1], ecosystem: "pub" }
                : null;
        }

        case "ruby": {

            const match = line.match(
                /^\s*(?:require|gem)\s+['"]([^'"]+)['"]/
            );

            return match
                ? { name: match[1], ecosystem: "bundler" }
                : null;
        }

        case "csharp": {

            const match = line.match(
                /^\s*using\s+(?:static\s+)?(?:[a-zA-Z0-9_]+\s*=\s*)?([a-zA-Z0-9_.]+)\s*;/
            );

            return match
                ? { name: match[1], ecosystem: "nuget" }
                : null;
        }

        default:
            return null;
    }
}
