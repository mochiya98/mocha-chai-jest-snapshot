const { expect } = require("chai");

describe("foo", function () {
  it("bar", function () {
    expect("raw").toMatchSnapshot();
  });
});
