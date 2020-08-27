import mocha, { Runner, MochaOptions } from "mocha";
import { _setReporterAttached, _getSnapshotManager } from "..";

export function getHookReporter(
  Base: unknown
): (runner: Runner, options: MochaOptions) => void {
  _setReporterAttached();
  function HookReporter(runner, options) {
    const inst = new (Base as (runner: Runner, options: MochaOptions) => void)(
      runner,
      options
    );
    runner.once(mocha.Runner.constants.EVENT_RUN_END, function () {
      const manager = _getSnapshotManager();
      if (manager) {
        manager.report();
        console.log("");
      }
    });
    return inst;
  }
  return HookReporter;
}
