import path from "path";

import mockRequire from "mock-require";

import Mocha, { MochaOptions, Runner } from "mocha";
import { argv } from "yargs";

import { applyMockFs, resolvePath, collectSnapshots } from "./helper";
import { MochaRunnerRunMsg, MochaRunnerRecvMsg } from "./types";

mockRequire("test-serializer", {
  serialize() {
    return "serialized";
  },
  test() {
    return true;
  },
});
mockRequire("find-package-json", (basePath: string) => {
  const filename = path.resolve(basePath, "package.json");
  let value = {};
  try {
    value = require(filename);
  } catch (e) {}
  return {
    done: false,
    value,
    filename,
    next() {
      return this;
    },
  };
});
mockRequire("mocha-chai-jest-snapshot", require(resolvePath("src")));

async function run(mochaOptions: Partial<MochaOptions>) {
  const mocha = new Mocha({ color: false, reporter: "spec", ...mochaOptions });
  mocha.addFile(resolvePath(`test/integration/setup.js`));
  mocha.addFile(
    resolvePath(`test/integration/fixtures/${argv.project}/test.js`)
  );
  await new Promise((resolve) => {
    mocha.run().once(Runner.constants.EVENT_RUN_END, resolve);
  });
  const snapshots = await collectSnapshots(argv.project as string);
  process.send({ type: "result", snapshots });
}

new Promise<MochaRunnerRunMsg>((resolve) => {
  process.once("message", function (msg: MochaRunnerRecvMsg) {
    switch (msg.type) {
      case "run":
        resolve(msg);
        break;
    }
  });
}).then((msg) => {
  if (!msg.disableMock) applyMockFs();
  run(msg.mochaOptions);
});
