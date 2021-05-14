import path from "path";

import { buildSnapshotResolver } from "jest-snapshot";
import { SnapshotStateOptions } from "jest-snapshot/build/State";
import { Config } from "@jest/types";
import yargs from "yargs";

export const snapshotResolver = buildSnapshotResolver({
  rootDir: "default",
} as Config.ProjectConfig);

const ARGV_CI = !!process.env.CI;
const ARGV_UPDATE_SNAPSHOT =
  !!process.env.UPDATE_SNAPSHOT ||
  yargs.options({
    update: { type: "boolean", default: false },
  }).argv.update;

export const snapshotOptions: SnapshotStateOptions = {
  updateSnapshot:
    ARGV_CI && !ARGV_UPDATE_SNAPSHOT
      ? "none"
      : ARGV_UPDATE_SNAPSHOT
      ? "all"
      : "new",
  // unused
  getPrettier: () => null,
  getBabelTraverse: () =>
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    (() => {}) as unknown as typeof import("@babel/traverse").default,
};

export function readJestConfig(
  rootDir: Config.Path
): Partial<Config.ProjectConfig> | undefined {
  try {
    const jestConfig = require(path.join(rootDir, "./jest.config"));
    return typeof jestConfig === "function" ? jestConfig() : jestConfig;
  } catch (e) {
    return undefined;
  }
}
