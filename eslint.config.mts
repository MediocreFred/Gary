import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: { globals: globals.node },
    rules: {
      ...js.configs.recommended.rules
    }
  },
  {
    files: ["**/*.{ts,mts,cts}"],
    languageOptions: { globals: globals.node },
    rules: {
      ...tseslint.configs.recommended.rules
    }
  },
  {
    files: ["test/**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: { globals: { ...globals.node, ...globals.mocha } }
  }
];
