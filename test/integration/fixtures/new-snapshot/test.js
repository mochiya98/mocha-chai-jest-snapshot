const { expect } = require("chai");

describe("foo", function () {
  it("bar", function () {
    expect("new").toMatchSnapshot();
  });
});
