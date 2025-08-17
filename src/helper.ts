import path from "node:path";

import { SnapshotStateOptions } from "jest-snapshot/build/State";
import { Config } from "@jest/types";
import margs from "./margs";

const args = margs
  .options({
    update: { type: "boolean", default: false },
  })
  .parseSync();

const ARGV_CI = !!process.env.CI;
const ARGV_UPDATE_SNAPSHOT = !!process.env.UPDATE_SNAPSHOT || args.update;

export const snapshotOptions: SnapshotStateOptions = {
  updateSnapshot:
    ARGV_CI && !ARGV_UPDATE_SNAPSHOT
      ? "none"
      : ARGV_UPDATE_SNAPSHOT
        ? "all"
        : "new",
  // unused
  prettierPath: "prettier",
};

export function readJestConfig(
  rootDir: string
): Partial<Config.ProjectConfig> | undefined {
  try {
    const jestConfig = require(path.join(rootDir, "./jest.config"));
    return typeof jestConfig === "function" ? jestConfig() : jestConfig;
  } catch (e) {
    return undefined;
  }
}
