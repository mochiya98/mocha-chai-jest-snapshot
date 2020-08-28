import { promises as fs } from "fs";
import path from "path";

import mockFs from "mock-fs";

export function resolvePath(relativePath: string): string {
  return path.resolve(__dirname, "../../../../", relativePath);
}

export function applyMockFs(): void {
  mockFs(
    {
      [resolvePath("./")]: mockFs.load(resolvePath("./")),
    },
    { createCwd: false, createTmp: false }
  );
}

export async function collectSnapshots(
  projectName: string
): Promise<Record<string, string>> {
  const snapshotDir = resolvePath(
    `test/integration/fixtures/${projectName}/__snapshots__`
  );
  const snapshots: Record<string, string> = {};
  try {
    for (const fn of await fs.readdir(snapshotDir)) {
      snapshots[fn] = (
        await fs.readFile(path.join(snapshotDir, fn))
      ).toString();
    }
  } catch (e) {}
  return snapshots;
}
