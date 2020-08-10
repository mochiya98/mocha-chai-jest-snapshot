import { use as chaiUse } from "chai";

import { addSerializer, getSerializers } from "jest-snapshot";
import SnapshotManager from "./manager";

type FirstFunctionArgument<T> = T extends (arg: infer A) => unknown ? A : never;
type ChaiPlugin = FirstFunctionArgument<typeof chaiUse>;

const manager = new SnapshotManager();

const initSnapshotManager: ChaiPlugin = function (chai, utils) {
  beforeEach(function () {
    if (this.currentTest) manager.setContext(this.currentTest);
  });
  after(function () {
    manager.saveSnap();
    manager.report();
  });
  utils.addMethod(chai.Assertion.prototype, "matchSnapshot", function (
    this: Record<string, unknown>,
    message?: string
  ) {
    const expected = utils.flag(this, "object");
    manager.assert(expected, message);
  });
};

export { initSnapshotManager, addSerializer, getSerializers };

declare global {
  namespace Chai {
    interface Assertion {
      /** Assert that the object matches the snapshot */
      matchSnapshot(message?: string): Assertion;
    }
  }
}
