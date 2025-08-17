import path from "node:path";
import fs from "node:fs";

import mockRequire from "mock-require";

import Mocha, { MochaOptions, Runner } from "mocha";
import margs from "../../../../src/margs";

const argv = margs
  .options({
    project: { type: "string", demandOption: true },
  })
  .parseSync() as { project: string };

import { resolvePath, collectSnapshots, restoreSnapshots } from "./helper";
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
    value = JSON.parse(fs.readFileSync(filename, "utf-8"));
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
  const snapshots = await collectSnapshots(argv.project);
  process.send!({ type: "result", snapshots: snapshots || {} });
}

new Promise<MochaRunnerRunMsg>((resolve) => {
  process.once("message", function (msg: MochaRunnerRecvMsg) {
    switch (msg.type) {
      case "run":
        resolve(msg);
        break;
    }
  });
}).then(async (msg) => {
  const beforeSnapshots = await collectSnapshots(argv.project);
  await run(msg.mochaOptions);
  if (!msg.disableMock) {
    await restoreSnapshots(argv.project, beforeSnapshots);
  }
});
