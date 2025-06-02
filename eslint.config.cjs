const eslintRecommended = require("@eslint/js");
const cypress = require("eslint-plugin-cypress");

module.exports = [
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
