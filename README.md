# 🍵mocha-chai-jest-snapshot📷

![npm](https://img.shields.io/npm/v/mocha-chai-jest-snapshot?style=flat-square) ![MIT](https://img.shields.io/npm/l/mocha-chai-jest-snapshot?style=flat-square)

[![NPM](https://nodei.co/npm/mocha-chai-jest-snapshot.png)](https://nodei.co/npm/mocha-chai-jest-snapshot/)

provides snapshot testing like jest

## Features

- ✅ Simple to use
- ✅ Output the same snapshot file as jest
- ✅ Output the same snapshot summary as jest
- ✅ Detect obsolete snapshots
- ✅ Support custom serializer
- ✅ Support typescript

## Usage

```bash
npm i -D mocha-chai-jest-snapshot
```

then add it to the test setup:

```js
// e.g. setup.js (mocha --require setup.js)
import * as chai from "chai";
import { jestSnapshotPlugin } from "mocha-chai-jest-snapshot";

export const mochaHooks = {
  before() {
    chai.use(jestSnapshotPlugin());
  }
}
```

enjoy.

```js
import { expect } import "chai";
it("foo", function () {
  expect({ foo: "bar" }).toMatchSnapshot();
});
```

```
> chai-snapshot@1.0.0 test /mnt/x/chai-snapshot
> npx mocha --file setup.js -r ts-node/register test/**/*.ts


  ✓ foo

Snapshot Summary
 › 1 snapshot written from 1 test suite.

  1 passing (9ms)
```

```js
// Jest Snapshot v1, https://goo.gl/fbAQLP

exports[`foo 1`] = `
Object {
  "foo": "bar",
}
`;
```

### update snapshots

```bash
# set envoriment
UPDATE_SNAPSHOT=1 mocha ...
# or add command line argument
mocha ... --update
```

### report at the end

```bash
npx mocha ... --reporter mocha-chai-jest-snapshot/reporters/spec
```

### with options

#### jest options (setup)

```js
import * as chai from "chai";
import { jestSnapshotPlugin } from "mocha-chai-jest-snapshot";

chai.use(
  jestSnapshotPlugin({
    rootDir: "../",
    snapshotResolver: "<rootDir>/jest/snapshotResolver",
    snapshotSerializers: ["jest-serializer-vue"],
  })
);
```

#### jest options (package.json)

```json
{
  "jest": {
    "rootDir": "../",
    "snapshotResolver": "<rootDir>/jest/snapshotResolver",
    "snapshotSerializers": ["jest-serializer-vue"]
  }
}
```

#### jest options (jest.config.js)

```js
module.exports = {
  rootDir: "../",
  snapshotResolver: "<rootDir>/jest/snapshotResolver",
  snapshotSerializers: ["jest-serializer-vue"],
};
```

#### custom serializer

```js
import * as chai from "chai";
import {
  jestSnapshotPlugin,
  addSerializer,
} from "mocha-chai-jest-snapshot";
import customSerializer = from "...";

export const mochaHooks = {
  before() {
    chai.use(jestSnapshotPlugin());
    addSerializer(customSerializer);
  }
}
```

or

```js
import { expect } from "chai";
import customSerializer from "...";

expect.addSnapshotSerializer(customSerializer);
```
