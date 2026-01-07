import {
  type Comparison,
  type Linter,
  linterNames,
} from "@flint.fyi/comparisons";
import { pluginNames } from "./strings.ts";

export function createIssueBody(comparison: Comparison) {
  const { name, plugin } = comparison.flint;

  return `### Feature Request Checklist

- [x] I have pulled the latest \`main\` branch of the repository.
- [x] I have [searched for related issues](https://github.com/JoshuaKGoldberg/flint/issues?q=is%3Aissue) and found none that matched my issue.

### Overview

Per [flint.fyi/rules](https://www.flint.fyi/rules), Flint is intended to have a \`${name}\` rule in the ${
    pluginNames[plugin]
  } plugin (\`${plugin}\`). It'll behave roughly equivalently to the existing implementations in other linters to start. This issue tracks adding that rule.

Adding this rule will entail creating the following new source files:

* \`packages/${plugin}/src/rules/${name}.ts\`: implementation of the rule itself
* \`packages/${plugin}/src/rules/${name}.test.ts\`: tests for the rule
* \`packages/site/src/content/docs/rules/${plugin}/${name}.mdx\`: documentation of the rule

Additionally, the following files will need to be edited:

* \`packages/comparisons/src/data.json\`: Comparisons data will need to mention the rule is now \`"status": "implemented"\`
* \`packages/${plugin}/src/plugin.ts\`: Included rules should have the new one inserted in alphabetical order

### Additional Info

Existing rules in other linters:

${Object.entries(linterNames)
  .filter(([linter]) => !!comparison[linter as Linter])
  .map(
    ([linter, linterName]) =>
      `* ${linterName}: ${comparison[linter as Linter]
        ?.flatMap((entry) => `[\`${entry.name}\`](${entry.url})`)
        .join(", ")}`
  )
  .join("\n")}

❤️‍🔥`;
}
