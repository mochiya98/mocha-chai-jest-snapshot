/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
  SnapshotSummary,
  TestResult,
  makeEmptyAggregatedTestResult,
} from "@jest/test-result";
import { SnapshotState } from "jest-snapshot";

type SnapshotStateOptions = ConstructorParameters<typeof SnapshotState>[1];

type SnapshotResult = TestResult["snapshot"];

export { SnapshotSummary };

export const makeEmptySnapshotSummary = (
  options: SnapshotStateOptions
): SnapshotSummary => {
  const summary = makeEmptyAggregatedTestResult().snapshot;
  summary.didUpdate = options.updateSnapshot === "all";
  return summary;
};

export const packSnapshotState = (
  snapshotState: SnapshotState
): SnapshotResult => {
  const snapshot: SnapshotResult = {
    added: 0,
    fileDeleted: false,
    matched: 0,
    unchecked: 0,
    uncheckedKeys: [],
    unmatched: 0,
    updated: 0,
  };
  const uncheckedCount = snapshotState.getUncheckedCount();
  const uncheckedKeys = snapshotState.getUncheckedKeys();
  if (uncheckedCount) {
    snapshotState.removeUncheckedKeys();
  }

  const status = snapshotState.save();
  snapshot.fileDeleted = status.deleted;
  snapshot.added = snapshotState.added;
  snapshot.matched = snapshotState.matched;
  snapshot.unmatched = snapshotState.unmatched;
  snapshot.updated = snapshotState.updated;
  snapshot.unchecked = !status.deleted ? uncheckedCount : 0;
  // Copy the array to prevent memory leaks
  snapshot.uncheckedKeys = Array.from(uncheckedKeys);

  return snapshot;
};

export const addSnapshotResult = (
  snapshotSummary: SnapshotSummary,
  snapshotResult: SnapshotResult,
  testFilePath: string
): void => {
  // Snapshot data
  if (snapshotResult.added) {
    snapshotSummary.filesAdded++;
  }
  if (snapshotResult.fileDeleted) {
    snapshotSummary.filesRemoved++;
  }
  if (snapshotResult.unmatched) {
    snapshotSummary.filesUnmatched++;
  }
  if (snapshotResult.updated) {
    snapshotSummary.filesUpdated++;
  }

  snapshotSummary.added += snapshotResult.added;
  snapshotSummary.matched += snapshotResult.matched;
  snapshotSummary.unchecked += snapshotResult.unchecked;
  if (snapshotResult.uncheckedKeys && snapshotResult.uncheckedKeys.length > 0) {
    snapshotSummary.uncheckedKeysByFile.push({
      filePath: testFilePath,
      keys: snapshotResult.uncheckedKeys,
    });
  }

  snapshotSummary.unmatched += snapshotResult.unmatched;
  snapshotSummary.updated += snapshotResult.updated;
  snapshotSummary.total +=
    snapshotResult.added +
    snapshotResult.matched +
    snapshotResult.unmatched +
    snapshotResult.updated;
};
