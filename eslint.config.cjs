const eslintRecommended = require("@eslint/js");
const cypress = require("eslint-plugin-cypress");

module.exports = [
  eslintRecommended.configs.recommended,
  {
    plugins: {
      cypress,
    },
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 12,
      sourceType: "module",
      globals: {
        cy: true,
        Cypress: true,
        describe: true,
        it: true,
        before: true,
        beforeEach: true,
        after: true,
        afterEach: true,
        context: true,
        expect: true,
        window: true,
        document: true,
        navigator: true,
        location: true,
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      eqeqeq: "error",
      curly: "error",
      semi: ["error", "always"],
      quotes: ["error", "double"],
    },
  },
];
