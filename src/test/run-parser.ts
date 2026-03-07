import { parsePackageJson } from "../core/parsers/parse-package-json";
import { parseRequirementsTxt } from "../core/parsers/parse-requirements";

console.log("----- Testing package.json parser -----");

const packageContent = `
{
  "dependencies": {
    "react": "^18.2.0",
    "next": "14.1.0"
  }
}
`;

const pkgResult = parsePackageJson(packageContent);
console.log(pkgResult);


console.log("\n----- Testing requirements.txt parser -----");

const requirementsContent = `
flask==2.3.0
numpy==1.26.0
pandas
`;

const reqResult = parseRequirementsTxt(requirementsContent);
console.log(reqResult);