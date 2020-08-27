module.exports = {
  extends: [
    "standard",
    "prettier",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error",
    "no-unused-vars": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-namespace": "off",
    "import/no-unresolved": "off",
    "no-console": "off",
    "@typescript-eslint/no-var-requires": "off",
  },
  overrides: [
    {
      files: ["**/*.ts"],
      rules: { "@typescript-eslint/no-var-requires": ["error"] },
    },
  ],
};
