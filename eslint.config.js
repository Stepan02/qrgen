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
    },
    settings: {},
    environments: ["cypress"],
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
