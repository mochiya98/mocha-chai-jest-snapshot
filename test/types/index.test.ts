import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { assert } from "chai";

function getCompilerOptions() {
  const configFile = ts.readConfigFile(
    path.resolve(__dirname, "./tsconfig.json"),
    ts.sys.readFile
  );
  const { compilerOptions } = configFile.config;
  if (compilerOptions.baseUrl) {
    compilerOptions.baseUrl = path.resolve(__dirname, compilerOptions.baseUrl);
  }
  if (compilerOptions.paths) {
    compilerOptions.paths = Object.fromEntries(
      Object.entries<string[]>(compilerOptions.paths).map(([k, v]) => [
        k,
        v.map((p) => path.resolve(__dirname, p)),
      ])
    );
  }
  if (compilerOptions.types) {
    compilerOptions.types = compilerOptions.types.map((p: string) =>
      path.resolve(__dirname, p)
    );
  }
  return compilerOptions;
}

function checkTypes(filePath: string): void {
  const program = ts.createProgram(
    [path.resolve(__dirname, filePath)],
    getCompilerOptions()
  );

  const errors = ts.getPreEmitDiagnostics(program).map((diagnostic) => {
    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        diagnostic.start!
      );
      const message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );
      return `${path.relative(__dirname, diagnostic.file.fileName)} (${
        line + 1
      },${character + 1}): ${message}`;
    } else {
      return ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    }
  });
  if (errors.length) {
    assert.fail(errors.join("\n"));
  }
}

describe("check types", function () {
  const fixturesDir = path.resolve(__dirname, "./fixtures");
  for (const filePath of fs.readdirSync(fixturesDir)) {
    it(path.basename(filePath, ".ts"), function () {
      this.timeout(1000 * 60 * 2);
      checkTypes(path.resolve(fixturesDir, filePath));
    });
  }
});
