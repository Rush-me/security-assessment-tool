const fs = require("fs");
const path = require("path");

class SelfHealingUtils {
  constructor(page) {
    this.page = page;
    this.reportFile = path.join(__dirname, "..", "reports", "healing-report.json");
  }

  async clickWithHealing(locatorCandidates, contextName) {
    return this.executeWithHealing("click", locatorCandidates, contextName);
  }

  async fillWithHealing(locatorCandidates, value, contextName) {
    const target = await this.executeWithHealing("find", locatorCandidates, contextName);
    await target.fill(value);
    return target;
  }

  async executeWithHealing(action, locatorCandidates, contextName) {
    const attempted = [];

    for (const candidate of locatorCandidates) {
      try {
        const locator = this.resolveLocator(candidate);
        await locator.first().waitFor({ timeout: 3000 });

        if (action === "click") {
          await locator.first().click();
          this.logHealing(contextName, candidate, true, attempted);
          return locator.first();
        }

        if (action === "find") {
          this.logHealing(contextName, candidate, true, attempted);
          return locator.first();
        }
      } catch (_err) {
        attempted.push(candidate);
      }
    }

    await this.captureDomArtifacts(contextName);
    this.logHealing(contextName, null, false, attempted);
    throw new Error(`Self-healing failed for ${contextName}`);
  }

  resolveLocator(candidate) {
    if (candidate.type === "testId") return this.page.getByTestId(candidate.value);
    if (candidate.type === "role") return this.page.getByRole(candidate.role, candidate.options || {});
    if (candidate.type === "label") return this.page.getByLabel(candidate.value);
    if (candidate.type === "placeholder") return this.page.getByPlaceholder(candidate.value);
    if (candidate.type === "text") return this.page.getByText(candidate.value, candidate.options || {});
    if (candidate.type === "css") return this.page.locator(candidate.value);
    if (candidate.type === "xpath") return this.page.locator(`xpath=${candidate.value}`);
    throw new Error(`Unknown locator candidate type: ${candidate.type}`);
  }

  async captureDomArtifacts(contextName) {
    const baseDir = path.join(__dirname, "..", "reports", "healing");
    fs.mkdirSync(baseDir, { recursive: true });
    const ts = Date.now();

    const htmlPath = path.join(baseDir, `${contextName}-${ts}.html`);
    const shotPath = path.join(baseDir, `${contextName}-${ts}.png`);
    const a11yPath = path.join(baseDir, `${contextName}-${ts}-a11y.json`);

    fs.writeFileSync(htmlPath, await this.page.content(), "utf8");
    await this.page.screenshot({ path: shotPath, fullPage: true });

    const snapshot = await this.page.accessibility.snapshot();
    fs.writeFileSync(a11yPath, JSON.stringify(snapshot, null, 2), "utf8");
  }

  logHealing(contextName, selectedCandidate, success, attempted) {
    const record = {
      timestamp: new Date().toISOString(),
      contextName,
      success,
      selectedCandidate,
      attempted
    };

    const dir = path.dirname(this.reportFile);
    fs.mkdirSync(dir, { recursive: true });

    const current = fs.existsSync(this.reportFile)
      ? JSON.parse(fs.readFileSync(this.reportFile, "utf8"))
      : [];

    current.push(record);
    fs.writeFileSync(this.reportFile, JSON.stringify(current, null, 2), "utf8");
  }
}

module.exports = SelfHealingUtils;
