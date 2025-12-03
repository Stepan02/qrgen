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
        cy: "readonly",
        Cypress: "readonly",
        describe: "readonly",
        it: "readonly",
        before: "readonly",
        beforeEach: "readonly",
        after: "readonly",
        afterEach: "readonly",
        context: "readonly",
        expect: "readonly",

        // dom
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        location: "readonly",
        
        // javascript
        console: "readonly",
        URL: "readonly",
        fetch: "readonly",
        module: "readonly",
        require: "readonly",
        ClipboardItem: "readonly",
        $: "readonly",

        // custom functions
        download: true, 
        changelog: true,
        tutorial: true, 
        demo: true, 
        home: true, 
        clippy: true,
        copyClippy: true
      },
    },
    rules: {
      "no-unused-vars": "off",
      "no-console": "off",
      "camelcase": ["error", {"properties": "always"}],
      "max-len": ["error", 120],
      eqeqeq: "error",
      curly: "error",
      semi: ["error", "always"],
      quotes: ["error", "double"],
    },
  }
];
