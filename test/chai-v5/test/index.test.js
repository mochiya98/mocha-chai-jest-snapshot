import { expect } from "chai";

describe("chai-v5", () => {
  it("should work", () => {
    expect("chai v5").toMatchSnapshot();
  });
});
