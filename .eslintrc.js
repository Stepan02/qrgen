module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
    "cypress/globals": true,
  },
  extends: [
    "eslint:recommended",
    "plugin:cypress/recommended",
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: [
    'cypress',
  ],
  rules: {
    "no-unused-vars": "warn",
    "no-console": "off",
    "eqeqeq": "error",
    "curly": "error",
    "semi": ["error", "always"],
    "quotes": ["error", "double"],
  },
};
