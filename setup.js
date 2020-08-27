const chai = require("chai");
const { jestSnapshotPlugin } = require("./dist/");

chai.use(jestSnapshotPlugin());
