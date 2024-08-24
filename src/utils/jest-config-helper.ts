/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import path from "node:path";

export const replaceRootDirInPath = (
  rootDir: string,
  filePath: string
): string => {
  if (!/^<rootDir>/.test(filePath)) {
    return filePath;
  }

  return path.resolve(
    rootDir,
    path.normalize(`./${filePath.substring("<rootDir>".length)}`)
  );
};

type OrArray<T> = T | Array<T>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReplaceRootDirConfigObj = Record<string, any>;
type ReplaceRootDirConfigValues =
  | OrArray<ReplaceRootDirConfigObj>
  | OrArray<RegExp>
  | OrArray<string>;

export const replaceRootDirInObject = <T extends ReplaceRootDirConfigObj>(
  rootDir: string,
  config: T
): T => {
  const newConfig = {} as T;
  for (const configKey in config) {
    newConfig[configKey] =
      configKey === "rootDir"
        ? config[configKey]
        : _replaceRootDirTags(rootDir, config[configKey]);
  }
  return newConfig;
};

export const _replaceRootDirTags = <T extends ReplaceRootDirConfigValues>(
  rootDir: string,
  config: T
): T => {
  if (config == null) {
    return config;
  }
  switch (typeof config) {
    case "object":
      if (Array.isArray(config)) {
        /// can be string[] or {}[]
        return config.map((item) => _replaceRootDirTags(rootDir, item)) as T;
      }
      if (config instanceof RegExp) {
        return config;
      }

      return replaceRootDirInObject(
        rootDir,
        config as ReplaceRootDirConfigObj
      ) as T;
    case "string":
      return replaceRootDirInPath(rootDir, config) as T;
  }
};
