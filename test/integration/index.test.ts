import fs from "fs";
import path from "path";
import childProcess from "child_process";

import pLimit from "p-limit";
import { expect } from "chai";
import { MochaOptions } from "mocha";

import { MochaRunnerResultMsg } from "./utils/mochaRunner/types";

function normalizeOutput(src: string) {
  return src
    .replace(/\(\s*(?:[\d.:]+(?:ms|s|min|sec)\s*)+\)/gi, "")
    .replace(/:\d+:\d+(\)?)$/gm, "$1")
    .split(path.resolve(__dirname, "../../"))
    .join("<rootDir>");
}

type MochaRunnerConfig = {
  argv: string[];
  env: Record<string, string>;
  mochaOptions: MochaOptions;
  DISABLE_FS_MOCK: boolean;
};

function readProjectConfig(projectName: string): Partial<MochaRunnerConfig> {
  try {
    return require(path.resolve(
      __dirname,
      `./fixtures/${projectName}/config.js`
    ));
  } catch (e) {
    return {};
  }
}

const baseEnv = { ...process.env };
delete baseEnv.CI;

function runMochaIntegration(projectName: string): Promise<{
  stdout: string;
  stderr: string;
  snapshots: Record<string, string>;
}> {
  return new Promise((resolve, reject) => {
    try {
      const config: MochaRunnerConfig = {
        argv: [],
        env: {},
        mochaOptions: {},
        DISABLE_FS_MOCK: false,
        ...readProjectConfig(projectName),
      };
      const proc = childProcess.fork(
        path.resolve(__dirname, "./utils/mochaRunner"),
        [`--project=${JSON.stringify(projectName)}`, ...config.argv],
        {
          cwd: path.resolve(__dirname, `./fixtures/${projectName}/`),
          env: { ...baseEnv, ...config.env },
          execArgv: ["-r", "ts-node/register/transpile-only"],
          silent: true,
        }
      );
      const stdoutBuf = [];
      const stderrBuf = [];
      let snapshots = {};
      proc.stdout.on("data", (c) => stdoutBuf.push(c));
      proc.stderr.on("data", (c) => stderrBuf.push(c));
      proc.on("message", function (msg: MochaRunnerResultMsg) {
        switch (msg.type) {
          case "result":
            snapshots = msg.snapshots;
            break;
        }
      });
      proc.on("exit", () => {
        resolve({
          stdout: normalizeOutput(Buffer.concat(stdoutBuf).toString()),
          stderr: normalizeOutput(Buffer.concat(stderrBuf).toString()),
          snapshots,
        });
      });
      proc.send({
        type: "run",
        mochaOptions: config.mochaOptions,
        disableMock: config.DISABLE_FS_MOCK,
      });
    } catch (e) {
      reject(e);
    }
  });
}

const limitMochaWorker = pLimit(4);

describe("mocha integration", function () {
  for (const projectName of fs.readdirSync(
    path.resolve(__dirname, "./fixtures")
  )) {
    const queue = limitMochaWorker(() => runMochaIntegration(projectName));
    it(projectName, async function () {
      this.timeout(1000 * 60 * 3);
      const result = await queue;
      expect(result).to.matchSnapshot();
    });
  }
});

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
