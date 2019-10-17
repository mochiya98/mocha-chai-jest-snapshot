import chai from "chai";
import { Runnable, Context } from "mocha";
import { SnapshotState, SnapshotStateType } from "jest-snapshot";

import {
  SnapshotSummary,
  packSnapshotState,
  addSnapshotResult,
  makeEmptySnapshotSummary
} from "./utils/jest-test-result-helper";
import { getSnapshotSummaryOutput } from "./utils/jest-reporters-lite";
import { snapshotResolver, snapshotOptions } from "./helper";

const { expect } = chai;

class SnapshotManager {
  snapshotState: SnapshotStateType | null = null;
  snapshotSummary: SnapshotSummary = makeEmptySnapshotSummary(snapshotOptions);
  context: Runnable | Context | null = null;
  testFile = "";

  onFileChanged(): void {
    if (!this.context) return;

    if (this.snapshotState !== null) this.saveSnap();

    this.testFile = this.context.file;
    this.snapshotState = new SnapshotState(
      snapshotResolver.resolveSnapshotPath(this.testFile),
      snapshotOptions
    );
  }

  setContext(context: Runnable | Context) {
    if (!context.title || !context.file) return;

    this.context = context;
    if (this.testFile !== context.file) this.onFileChanged();
  }

  assert(received: unknown, message: string) {
    if (!this.snapshotState || !this.context) return;

    const { actual, expected, key, pass } = this.snapshotState.match({
      testName: this.context.fullTitle(),
      received
    });
    if (!pass) {
      expect(expected ? expected.trim() : "").equals(
        actual.trim(),
        message || `Snapshot name: \`${key}\``
      );
    }
  }

  saveSnap(): void {
    if (!this.testFile || !this.snapshotState) return;

    const packedSnapshotState = packSnapshotState(this.snapshotState);
    addSnapshotResult(this.snapshotSummary, packedSnapshotState, this.testFile);

    this.testFile = "";
    this.snapshotState = null;
  }

  report() {
    const outputs = getSnapshotSummaryOutput(this.snapshotSummary);
    if (outputs.length > 1) console.log("\n" + outputs.join("\n"));
  }
}

export default SnapshotManager;
