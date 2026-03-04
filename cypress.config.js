const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5500",
    specPattern: "tests/e2e/*.spec.{js,ts}",
    supportFile: false,
  },
  retries: {
    runMode: 2,
    openMode: 0,
  },
});
