const path = require("path");

module.exports = {
  timeout: Number(process.env.PW_TIMEOUT || 60000),
  use: {
    headless: process.env.HEADLESS === "true",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure"
  },
  outputDir: path.join(__dirname, "reports", "playwright-output")
};
