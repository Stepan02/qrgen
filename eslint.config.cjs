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
        // cypress
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

        // dom
        window: true,
        document: true,
        navigator: true,
        location: true,
        
        // javascript
        console: true,
        URL: true,
        fetch: true,
        module: true,
        require: true,
        $: true,

        // custom functions
        download: true, 
        changelog: true,
        tutorial: true, 
        demo: true, 
        home: true, 
        clippy: true,
        copyClippy: true,
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
