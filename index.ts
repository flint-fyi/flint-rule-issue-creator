import { octokitFromAuth } from "octokit-from-auth";

import { takeAsync } from "./takeAsync.ts";
import { iterateRulesToImplement } from "./iterateRulesToImplement.ts";
import { createIssueBody } from "./createIssueBody.ts";
import type { Strategy } from "./types.ts";
import { styleText } from "node:util";
import { pluginNames } from "./strings.ts";
import { writeCached } from "./cache.ts";

const goLive = !!process.env.GO_LIVE;

const issuesToCreate = 25;

const strategy = {
  kind: "in-plugin",
  plugin: "ts",
} satisfies Strategy;

const octokit = await octokitFromAuth();

const rulesToImplement = await takeAsync(
  iterateRulesToImplement(octokit, strategy),
  issuesToCreate,
);

for (const rule of rulesToImplement) {
  if (!goLive) {
    console.log(
      `${styleText("cyan", rule.flint.plugin)}/${styleText("blue", rule.flint.name)}`,
      styleText("gray", `(${rule.flint.preset})`),
    );
    continue;
  }

  console.log(styleText("gray", `Creating issue for ${rule.flint.name}...`));

  await octokit.rest.issues.create({
    body: createIssueBody(rule),
    labels: [
      "ai assigned",
      `plugin: ${rule.flint.plugin}`,
      "status: accepting prs",
      "type: feature",
    ],
    milestone: 3,
    owner: "JoshuaKGoldberg",
    repo: "flint",
    title: `🚀 Feature: Implement ${rule.flint.name} rule (${
      pluginNames[rule.flint.plugin]
    })`,
  });

  await writeCached(rule.flint.name, true);

  console.log(styleText("gray", "\tCreated."));
}
