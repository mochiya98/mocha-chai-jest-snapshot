const chai = require("chai");
const { jestSnapshotPlugin } = require("../../src");

chai.use(jestSnapshotPlugin());
