import { MochaOptions } from "mocha";

export type MochaRunnerResultMsg = {
  type: "result";
  snapshots: Record<string, string>;
};

export type MochaRunnerRunMsg = {
  type: "run";
  mochaOptions: Partial<MochaOptions>;
  disableMock: boolean;
};
export type MochaRunnerRecvMsg = MochaRunnerRunMsg;
