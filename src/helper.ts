import path from "node:path";

import type { SnapshotState } from "jest-snapshot";
import { Config } from "@jest/types";
import margs from "./margs";

const args = margs
  .options({
    update: { type: "boolean", default: false },
  })
  .parseSync();

type SnapshotStateOptions = ConstructorParameters<typeof SnapshotState>[1];

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
  snapshotFormat: {},
  rootDir: process.cwd(),
};

export function readJestConfig(
  rootDir: string,
): Partial<Config.ProjectConfig> | undefined {
  try {
    const jestConfig = require(path.join(rootDir, "./jest.config"));
    return typeof jestConfig === "function" ? jestConfig() : jestConfig;
  } catch (e) {
    return undefined;
  }
}
