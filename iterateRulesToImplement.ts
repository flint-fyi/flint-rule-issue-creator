import type { Octokit } from "octokit";

import { getESLintRulesBySize } from "./getESLintRulesBySize.ts";
import type { Strategy } from "./types.ts";
import { getESLintRulesInPlugin } from "./getESLintRulesInPlugin.ts";
import { styleText } from "node:util";
import type { Comparison } from "@flint.fyi/comparisons";
import { pluginNames } from "./strings.ts";
import { readCached, writeCached } from "./cache.ts";

async function doesRuleHaveIssue(comparison: Comparison, octokit: Octokit) {
  const cached = await readCached(comparison.flint.name);
  if (cached !== undefined) {
    return cached;
  }

  const response = await octokit.request("GET /search/issues", {
    q: `in:title "Feature: Implement ${comparison.flint.name} rule (${
      pluginNames[comparison.flint.plugin]
    })"`,
    type: "Issues",
    sort: "created",
    order: "desc",
  });

  await new Promise((resolve) => setTimeout(resolve, 3500));

  const result = !!response.data.items.length;

  await writeCached(comparison.flint.name, result);

  return result;
}

export async function* iterateRulesToImplement(
  octokit: Octokit,
  strategy: Strategy,
) {
  const candidates = await (strategy.kind === "by-size"
    ? getESLintRulesBySize()
    : getESLintRulesInPlugin(strategy));

  for (const candidate of candidates) {
    console.log(
      styleText(
        "gray",
        `Checking for existing issue on ${candidate.flint.name}...`,
      ),
    );
    if (await doesRuleHaveIssue(candidate, octokit)) {
      console.log(
        styleText("gray", `\t${candidate.flint.name} issue already exists.`),
      );
    } else {
      console.log(styleText("gray", `\tYielding ${candidate.flint.name}.`));
      yield candidate;
    }
  }
}
