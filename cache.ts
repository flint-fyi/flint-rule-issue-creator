import * as fs from "node:fs/promises";
import * as path from "node:path";

type RulesCache = Record<string, boolean>;

const cacheFilePath = "node_modules/.cache/flint-rule-issue-creator.json";
const cacheDirectory = path.dirname(cacheFilePath);

async function readCache() {
  try {
    return JSON.parse(await fs.readFile(cacheFilePath, "utf-8")) as RulesCache;
  } catch (error) {
    return {};
  }
}

export async function readCached(flintName: string) {
  return (await readCache())[flintName];
}

export async function writeCached(flintName: string, value: boolean) {
  await fs.mkdir(cacheDirectory, { recursive: true });
  await fs.writeFile(
    cacheFilePath,
    JSON.stringify(
      {
        ...(await readCache()),
        [flintName]: value,
      },
      null,
      4
    )
  );
}
