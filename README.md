# 🍵mocha-chai-jest-snapshot📷

![Travis (.org)](https://img.shields.io/travis/mochiya98/mocha-chai-jest-snapshot?style=flat-square) ![npm](https://img.shields.io/npm/v/mocha-chai-jest-snapshot?style=flat-square) ![MIT](https://img.shields.io/npm/l/mocha-chai-jest-snapshot?style=flat-square)

provides snapshot testing like jest

## Features

- ✅ Simple to use
- ✅ Output the same snapshot file as jest
- ✅ Output the same snapshot summary as jest
- ✅ Detect obsolete snapshots
- ✅ Supports custom serializer
- ✅ Contains typescript definition

## Usage

```bash
npm i -D mocha-chai-jest-snapshot
```

then add to your test setup:


```js
// e.g. setup.js (mocha --file setup.js)
const chai = require("chai");
const { initSnapshotManager } = require("mocha-chai-jest-snapshot");

chai.use(initSnapshotManager);
```

enjoy.

```js
const { expect } = require("chai");
it("foo", function(){
	expect({foo: "bar"}).to.matchSnapshot();
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

if you want to update snapshots, add `--update` arg or set the env `UPDATE_SNAPSHOT`.

```bash
UPDATE_SNAPSHOT=1 mocha ...
# or
mocha ... --update
```

optionally you can add serializer:

```js
const chai = require("chai");
const { initSnapshotManager, addSerializer } = require("mocha-chai-jest-snapshot");
const customSerializer = require("...");

chai.use(initSnapshotManager);
addSerializer(customSerializer);
```
