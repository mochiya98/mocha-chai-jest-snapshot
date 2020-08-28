const { expect } = require("chai");

expect.addSnapshotSerializer(require("test-serializer"));

describe("foo", function () {
  it("bar", function () {
    expect("raw").toMatchSnapshot();
  });
});
