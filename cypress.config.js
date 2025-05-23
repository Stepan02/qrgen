const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5500",
    setupNodeEvents(on, config) {
      // add more events if needed
    },
  },
  retries: {
    runMode: 2,
    openMode: 0,
  },
});
