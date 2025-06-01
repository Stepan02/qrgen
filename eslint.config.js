import eslintRecommended from "@eslint/js";
import cypress from "eslint-plugin-cypress";

export default [
  eslintRecommended.configs.recommended,
  {
    plugins: {
      cypress: cypress,
    },
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 12,
      sourceType: "module",
      globals: {
        ...cypress.environments.globals.globals,
        browser: true,
        node: true,
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "eqeqeq": "error",
      "curly": "error",
      "semi": ["error", "always"],
      "quotes": ["error", "double"],
    },
  },
];
