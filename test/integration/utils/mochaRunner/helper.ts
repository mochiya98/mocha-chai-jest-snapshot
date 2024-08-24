import { promises as fs } from "node:fs";
import path from "node:path";

export function resolvePath(relativePath: string): string {
  return path.resolve(__dirname, "../../../../", relativePath);
}

export async function collectSnapshots(
  projectName: string
): Promise<Record<string, string> | null> {
  const snapshotDir = resolvePath(
    `test/integration/fixtures/${projectName}/__snapshots__`
  );
  const snapshots: Record<string, string> = {};
  let files: string[] | null = null;
  try {
    files = await fs.readdir(snapshotDir);
  } catch (e) {}
  if (files !== null) {
    for (const fn of files) {
      snapshots[fn] = (
        await fs.readFile(path.join(snapshotDir, fn))
      ).toString();
    }
  }
  return files ? snapshots : null;
}

export async function restoreSnapshots(
  projectName: string,
  beforeSnapshots: Record<string, string> | null
) {
  const afterSnapshots = await collectSnapshots(projectName);
  if (beforeSnapshots === null) {
    fs.rm(
      resolvePath(`test/integration/fixtures/${projectName}/__snapshots__`),
      { recursive: true }
    );
  } else {
    fs.mkdir(
      resolvePath(`test/integration/fixtures/${projectName}/__snapshots__`)
    );
    const files = new Set([
      ...Object.keys(beforeSnapshots),
      ...Object.keys(afterSnapshots || {}),
    ]);
    for (const fn of files) {
      const before = beforeSnapshots[fn];
      const after = afterSnapshots![fn];
      if (before === undefined && after !== undefined) {
        await fs.rm(
          resolvePath(
            `test/integration/fixtures/${projectName}/__snapshots__/${fn}`
          )
        );
      } else if (before !== after) {
        await fs.writeFile(
          resolvePath(
            `test/integration/fixtures/${projectName}/__snapshots__/${fn}`
          ),
          before
        );
      }
    }
  }
}
