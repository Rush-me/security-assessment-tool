const fs = require("fs");
const path = require("path");

function run() {
  const reportPath = path.join(__dirname, "..", "reports", "cucumber-report.json");
  const summaryPath = path.join(__dirname, "..", "reports", "execution-summary.json");

  if (!fs.existsSync(reportPath)) {
    process.exit(0);
  }

  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  let total = 0;
  let passed = 0;
  let failed = 0;

  for (const feature of report) {
    for (const element of feature.elements || []) {
      total += 1;
      const hasFailed = (element.steps || []).some((s) => s.result && s.result.status === "failed");
      if (hasFailed) {
        failed += 1;
      } else {
        passed += 1;
      }
    }
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    totalScenarios: total,
    passedScenarios: passed,
    failedScenarios: failed
  };

  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf8");
}

run();
