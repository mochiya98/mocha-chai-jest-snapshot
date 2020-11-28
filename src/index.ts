import path from "path";
import nodeUtil from "util";

import { use as chaiUse } from "chai";
import {
  addSerializer,
  getSerializers,
  buildSnapshotResolver,
} from "jest-snapshot";
import { Config } from "@jest/types";
import findPackageJson from "find-package-json";

import { DEPRECATED_CODE_INIT_SNAPSHOT_MANAGER } from "./constants";
import { replaceRootDirInObject } from "./utils/jest-config-helper";
import { readJestConfig } from "./helper";
import SnapshotManager from "./manager";

type FirstFunctionArgument<T> = T extends (arg: infer A) => unknown ? A : never;
type ChaiPlugin = FirstFunctionArgument<typeof chaiUse>;

let _manager: SnapshotManager;
let _reporterAttached = false;

export function _setReporterAttached(): void {
  _reporterAttached = true;
}

export function _getSnapshotManager(): SnapshotManager {
  return _manager;
}

const jestSnapshotPlugin = (
  optionalConfig?: Partial<Config.ProjectConfig>
): ChaiPlugin => {
  const packageJson = findPackageJson(process.cwd()).next();

  const rootDir = packageJson.done
    ? process.cwd()
    : path.dirname(packageJson.filename);

  const config = replaceRootDirInObject<Config.ProjectConfig>(rootDir, {
    rootDir,
    ...packageJson.value?.jest,
    ...readJestConfig(rootDir),
    ...optionalConfig,
  });

  // Jest tests snapshotSerializers in order preceding built-in serializers.
  // Therefore, add in reverse because the last added is the first tested.
  config.snapshotSerializers
    ?.concat()
    .reverse()
    .forEach((path) => {
      addSerializer(require.main.require(path));
    });

  _manager = new SnapshotManager({
    rootDir,
    snapshotResolver: buildSnapshotResolver(config),
  });

  return function (this: Mocha.Context, chai, utils) {
    beforeEach(function () {
      if (this.currentTest) _manager.setContext(this.currentTest);
    });
    after(function () {
      _manager.saveSnap();
      if (!_reporterAttached) _manager.report();
    });
    for (const key of ["matchSnapshot", "toMatchSnapshot"]) {
      utils.addMethod(
        chai.Assertion.prototype,
        key,
        function (this: Record<string, unknown>, message?: string) {
          const expected = utils.flag(this, "object");
          _manager.assert(expected, message);
        }
      );
    }
    chai.expect.addSnapshotSerializer = addSerializer;
  };
};

const initSnapshotManager: ChaiPlugin = nodeUtil.deprecate(
  jestSnapshotPlugin(),
  "chai.use(initSnapshotManager) was deprecated. use chai.use(jestSnapshotPlugin()) instead.",
  DEPRECATED_CODE_INIT_SNAPSHOT_MANAGER
);

export {
  initSnapshotManager,
  jestSnapshotPlugin,
  addSerializer,
  getSerializers,
};

type SnapshotSerializerPlugin = import("pretty-format").Plugin;
declare global {
  namespace Chai {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Assertion {
      /** Assert that the object matches the snapshot */
      toMatchSnapshot(message?: string): Assertion;
      matchSnapshot(message?: string): Assertion;
    }
    interface ExpectStatic {
      addSnapshotSerializer(serializer: SnapshotSerializerPlugin): void;
    }
  }
}
