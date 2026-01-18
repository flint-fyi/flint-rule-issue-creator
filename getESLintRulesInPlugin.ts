import { comparisons } from "@flint.fyi/comparisons";

import type { InPluginStrategy } from "./types.ts";

export async function getESLintRulesInPlugin(strategy: InPluginStrategy) {
  return comparisons.filter(
    (comparison) =>
      comparison.flint.plugin === strategy.plugin &&
      comparison.flint.status !== "skipped"
  );
}
