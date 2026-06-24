module.exports = {
  default: {
    paths: ["features/**/*.feature"],
    require: [
      "world/CustomWorld.js",
      "hooks/**/*.js",
      "step-definitions/**/*.js"
    ],
    requireModule: [],
    format: [
      "progress-bar",
      "json:reports/cucumber-report.json",
      "junit:reports/junit.xml"
    ],
    publishQuiet: true,
    parallel: Number(process.env.CUCUMBER_PARALLEL || 1),
    retry: Number(process.env.CUCUMBER_RETRY || 1),
    failFast: false,
    timeout: Number(process.env.STEP_TIMEOUT || 90000)
  }
};
