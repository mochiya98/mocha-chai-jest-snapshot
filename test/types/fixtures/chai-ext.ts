import { expect } from "chai";
import { Plugin as PrettyFromatPlugin } from "pretty-format";

const dummySnapshotPlugin: PrettyFromatPlugin = {
  print() {
    return "";
  },
  test() {
    return false;
  },
};

expect.addSnapshotSerializer(dummySnapshotPlugin);

describe("foo", function () {
  it("bar", function () {
    expect("raw").toMatchSnapshot();
    expect("raw").to.matchSnapshot();
  });
});
