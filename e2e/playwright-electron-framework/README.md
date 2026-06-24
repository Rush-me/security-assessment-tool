# ISRA Playwright Electron Automation Framework

Production-ready Electron automation framework generated for ISRA 2.0.

## Technology Stack
- Playwright Electron
- Cucumber (BDD)
- JavaScript (CommonJS)
- Page Object Model
- JUnit + JSON reporting
- GitHub Actions CI

## Folder Structure
- features: BDD feature files mapped from generated test cases
- step-definitions: Reusable step definitions with async/await
- pages: POM layer for UI actions and validations
- electron: Launch, window management, lifecycle hooks
- world: Shared test context and scenario data
- hooks: Before/After hooks and artifacts
- api: Reusable API client and domain APIs
- test-data: Factories/builders for dynamic test data
- utils: Self-healing, execution summary, logging, traceability
- .github/workflows: CI pipeline for smoke/regression execution

## Prerequisites
1. Node.js 20+ installed
2. Electron app dependencies installed in repository
3. Backend and frontend build artifacts available for Electron app startup

## Setup
```bash
cd generated/playwright-electron-framework
npm install
npx playwright install
```

## Environment
Copy `.env.example` to `.env` and adjust values:
- `ELECTRON_MAIN_PATH`
- `BACKEND_BASE_URL`
- `AUTH_USER`
- `AUTH_PASSWORD`

## Execute
```bash
npm test
npm run test:smoke
npm run test:sanity
npm run test:regression
npm run test:p0
npm run test:p1
npm run test:parallel

# direct runner usage
node TestRunner/TestRunner.js --profile smoke
node TestRunner/TestRunner.js --tags "@smoke and not @wip"
node TestRunner/TestRunner.js --parallel 2 --retry 1
```

## Reporting
Generated under `reports/`:
- `junit.xml`
- `cucumber-report.json`
- `execution-summary.json`
- `healing-report.json`

Failure artifacts:
- `screenshots/`
- `videos/`
- `traces/`

## Self-Healing
`utils/SelfHealingUtils.js` includes:
- multi-candidate locator fallback
- DOM capture on locator failure
- screenshot + accessibility snapshot capture
- healing audit trail report

## Traceability
Story-to-test-to-automation mapping:
- JavaScript map: `utils/TraceabilityMap.js`
- Markdown matrix: `traceability-mapping.md`

## Notes
- Feature coverage is centered on P0/P1 workflows from generated test cases.
- Locators use `getByTestId` first, with resilient fallback options.
- Step definitions call only page object methods for UI actions.
