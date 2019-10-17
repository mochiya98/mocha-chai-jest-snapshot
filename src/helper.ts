import { buildSnapshotResolver } from "jest-snapshot";
import { SnapshotStateOptions } from "jest-snapshot/build/State";
import { Config } from "@jest/types";
import yargs = require("yargs");

export const snapshotResolver = buildSnapshotResolver({
  rootDir: "default"
} as Config.ProjectConfig);

const ARGV_CI = !!process.env.CI;
const ARGV_UPDATE_SNAPSHOT =
  !!process.env.UPDATE_SNAPSHOT ||
  yargs.options({
    update: { type: "boolean", default: false }
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
  getBabelTraverse: () => () => null
};
