const { expect } = require("chai");
const { addSerializer } = require("mocha-chai-jest-snapshot");

addSerializer(require("test-serializer"));

describe("foo", function () {
  it("bar", function () {
    expect("raw").toMatchSnapshot();
  });
});
