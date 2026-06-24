# ISRA — Information Security Risk Assessment Tool

> ISO 27005-aligned security risk assessment for engineering projects.  
> Built with Angular 18 · Spring Boot 3 · Electron · Google Gemini AI

---

## What is ISRA?

ISRA (Information Security Risk Assessment) is a cross-platform desktop application that guides security engineers and project managers through a structured, seven-step risk assessment process aligned with the **ISO/IEC 27005 : 2022** standard.

The tool models the full chain from project context → business assets → supporting assets → vulnerabilities → risk scenarios → mitigations → report, computing inherent, mitigated and residual risk scores automatically as you work.

An optional **Google Gemini AI** integration suggests relevant threats and vulnerabilities based on the project description and asset context, accelerating assessments without replacing expert judgment.

---

## Architecture

```
security-assessment-tool/
├── frontend/          Angular 18 SPA (the UI)
├── backend/           Spring Boot 3 REST API + H2 embedded database
└── electron/          Electron shell that bundles frontend + backend into a desktop app
```

### How the layers connect

```
┌─────────────────────────────────────────┐
│  Electron (main.js)                     │
│  • Spawns Spring Boot JAR on a dynamic  │
│    port at startup                      │
│  • Loads Angular from localhost:4200    │
│    (dev) or from built dist/ (prod)     │
│  • Bridges IPC for native file/menu ops │
└───────────────┬────────────────────────┘
                │ HTTP (localhost)
┌───────────────▼────────────────────────┐
│  Spring Boot backend (port dynamic)    │
│  • REST API: /api/projects, /api/risks │
│  • H2 file database (persists to disk) │
│  • Gemini AI proxy                     │
└───────────────┬────────────────────────┘
                │ REST
┌───────────────▼────────────────────────┐
│  Angular frontend                      │
│  • 7-step assessment wizard            │
│  • Reactive forms, Angular Material    │
│  • Signals-based state management      │
└────────────────────────────────────────┘
```

All assessment data is stored **locally on the user's machine**. If AI integration is enabled, selected context is sent to the Gemini API to generate threat/vulnerability suggestions.

---

## Prerequisites

| Tool | Version | Check |
|---|---|---|
| Java (OpenJDK) | 17+ | `java -version` |
| Maven | 3.8+ | `mvn -version` |
| Node.js | 18+ | `node -version` |
| npm | 9+ | `npm -version` |
| Angular CLI | 18+ | `ng version` |

---

## Getting Started (Development)

### 1. Clone

```bash
git clone https://github.com/Rush-me/security-assessment-tool.git
cd security-assessment-tool
```

### 2. Install dependencies

```bash
# Electron shell
cd electron && npm install && cd ..

# Angular frontend
cd frontend && npm install && cd ..
```

### 3. Build the Spring Boot JAR

```bash
cd backend
mvn clean package -DskipTests
# Output: backend/target/security-risk-assessment-tool.jar
cd ..
```

> Only rebuild the JAR when you change Java code. Angular and Electron changes do not require a rebuild.

### 4. (Optional) Set the Gemini AI key

```bash
export ISRA_AI_API_KEY=AIzaSy...your-key-here
```

Without this the app runs in full manual mode — AI suggestion buttons are disabled. This is expected and not an error.

### 5. Start the Angular dev server

```bash
cd frontend
ng serve --port 4200
# Wait for: ✔ Compiled successfully
```

### 6. Launch Electron (new terminal)

```bash
cd electron
npm run electron:dev
```

What happens automatically:
1. Splash screen appears
2. Electron finds a free port (e.g. `43017`)
3. Electron spawns Spring Boot from `backend/target/` on that port
4. Once Spring Boot is ready, Electron loads `http://localhost:4200`
5. Splash closes, the app opens

---

## When to Restart What

| Layer | Changed files | Action |
|---|---|---|
| Spring Boot | Any `.java` file | Re-run `mvn clean package -DskipTests`, then restart Electron |
| Angular | Any `.ts` / `.html` / `.scss` | Nothing — auto hot-reloads |
| Electron | `main.js` / `preload.js` / `splash.html` | Restart `npm run electron:dev` |

---

## Building for Distribution

```bash
# 1. Build the Spring Boot JAR
(cd backend && mvn clean package -DskipTests)

# 2. Build Angular for production
(cd frontend && ng build --configuration production)

# 3. Download a bundled JRE (so end users don't need Java installed)
(cd electron && npm run download-jre)

# 4. Package for your platform
npm run dist:linux    # produces .AppImage and .deb
npm run dist:win      # produces .exe installer
npm run dist:mac      # produces .dmg
```

The packaged app bundles the JRE + Spring Boot JAR + Angular dist into a single self-contained installer. End users need nothing pre-installed.

---

## Project Structure

### Backend (`backend/`)

```
src/main/java/com/thalesgroup/isra/
├── controller/         REST controllers (one per domain entity)
│   ├── AuthController.java
│   ├── IsraProjectController.java
│   ├── BusinessAssetController.java
│   ├── SupportingAssetController.java
│   ├── VulnerabilityController.java
│   ├── RiskController.java
│   └── AiController.java
├── service/
│   ├── RiskCalculationService.java   ← core risk scoring logic
│   ├── FileStorageService.java
│   └── ai/
│       ├── GeminiAiProvider.java
│       └── RiskAiAssistService.java
├── model/              JPA entities
├── repository/         Spring Data repositories
├── dto/ai/             Request/response DTOs for AI endpoints
└── config/             CORS, RestTemplate config
resources/
└── application.properties
```

### Frontend (`frontend/src/app/`)

```
features/
├── auth/               Login and registration
├── dashboard/          Project list and search
├── project-layout/     Sidebar navigation shell (wraps steps 1–7)
├── basic-info/         Step 1 — Project metadata
├── project-context/    Step 2 — Scope, description, attachments
├── business-assets/    Step 3 — Primary assets with CIA+A ratings
├── supporting-assets/  Step 4 — Technical components
├── vulnerabilities/    Step 5 — CVE/vulnerability register
├── risks/              Step 6 — Risk scenario editor
└── reports/            Step 7 — KPI dashboard + export
core/
├── services/           API clients (project, risk, asset, AI status…)
├── guards/             Auth route guard
└── interceptors/       `X-Username` header injection (no JWT)
```

---

## Data Model

```
ISRAProject
├── ISRAProjectContext     (description, assumptions, requirements)
├── ISRAMetaTracking[]     (iteration history)
├── BusinessAsset[]        (+ BusinessAssetProperties: C, I, A, Au ratings)
├── SupportingAsset[]      (→ references BusinessAsset[])
├── Vulnerability[]        (→ references SupportingAsset[])
└── Risk[]
    ├── RiskLikelihood     (threat factor, occurrence, incident likelihood)
    ├── RiskImpact         (per-dimension impact scores)
    ├── RiskAttackPath[]   (→ chains Vulnerability[])
    └── RiskMitigation[]   (benefit %, cost, decision)
```

---

## Risk Calculation

ISRA calculates three scores per risk scenario automatically:

| Score | Definition |
|---|---|
| **Inherent Risk** | Risk before any mitigations |
| **Mitigated Risk** | Projected risk if all planned mitigations are applied |
| **Residual Risk** | Actual remaining risk after accepted (Reduce decision) mitigations |

**Threat Factor** is the average of five attacker profile attributes (Skill Level, Reward, Resource Access, Group Size, Intrusion Detection), each rated 1–9. It maps to Low / Medium / High / Very High.

**Residual Risk Level** thresholds:

| Level | Score Range |
|---|---|
| Low | 0.00 – 0.24 |
| Medium | 0.25 – 0.49 |
| High | 0.50 – 0.74 |
| Critical | 0.75 – 1.00 |

---

## AI Integration

ISRA uses the **Google Gemini** API to suggest threats and vulnerabilities relevant to the assets defined in the assessment. The feature is opt-in and requires an API key.

```bash
export ISRA_AI_API_KEY=AIzaSy...your-key-here
```

The AI status indicator in the app header shows one of three states:

| Badge | Meaning |
|---|---|
| 🟢 AI Available | Key set, internet reachable, suggestions enabled |
| ⚪ Offline | Key set but no internet connection |
| ⚪ Not Configured | No key provided — manual mode only |

AI suggestions are contextual starting points. Always review and validate them against your specific system and threat environment.

---

## API Endpoints (Backend)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate and receive the user profile (no JWT; client sends `X-Username` on subsequent requests) |
| `POST` | `/api/auth/register` | Create a new user account |
| `GET` | `/api/projects` | List all projects |
| `POST` | `/api/projects` | Create a new project |
| `GET` | `/api/projects/{id}` | Get project details |
| `PUT` | `/api/projects/{id}` | Update project |
| `GET` | `/api/projects/{id}/risks` | List all risk scenarios |
| `POST` | `/api/projects/{id}/risks` | Add a risk scenario |
| `PUT` | `/api/projects/{id}/risks/{riskId}` | Update a risk scenario |
| `DELETE` | `/api/projects/{id}/risks/{riskId}` | Delete a risk scenario |
| `GET` | `/api/projects/{id}/business-assets` | List business assets |
| `GET` | `/api/projects/{id}/supporting-assets` | List supporting assets |
| `GET` | `/api/projects/{id}/vulnerabilities` | List vulnerabilities |
| `GET` | `/api/ai/status` | Check AI availability |
| `POST` | `/api/ai/suggest-threats` | Get AI threat suggestions |
| `POST` | `/api/ai/suggest-vulnerabilities` | Get AI vulnerability suggestions |

---

## Configuration (`application.properties`)

```properties
# H2 file database (Electron passes app.data.dir at runtime)
spring.datasource.url=jdbc:h2:file:${app.data.dir}/securityrisk;AUTO_SERVER=TRUE
spring.datasource.driver-class-name=org.h2.Driver

# Server port (Electron passes a dynamic port at runtime)
server.port=${server.port:8080}

# File attachments
isra.upload.dir=${app.data.dir}/attachments

# CORS (allow Angular dev server and Electron file:// origin)
isra.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:4200,http://localhost:4201}

# AI (never hardcode the key here — use the environment variable)
isra.ai.provider=gemini
isra.ai.api-key=${ISRA_AI_API_KEY:}
isra.ai.model=gemini-3.1-flash-lite
isra.ai.base-url=https://generativelanguage.googleapis.com
```

---

## Logs

```
~/.config/SecurityRiskAssessmentTool/logs/
├── electron.log    Port allocation, backend spawn, window lifecycle
└── backend.log     Spring Boot output, API calls, Gemini errors
```

Tail live while the app is running:

```bash
tail -f ~/.config/SecurityRiskAssessmentTool/logs/electron.log
tail -f ~/.config/SecurityRiskAssessmentTool/logs/backend.log
```

---

## Coding Standards

This project follows the Angular 18 style guide with a few team-specific rules:

- Use **standalone components** — do not set `standalone: true` inside `@Component` (it is the default)
- Use **signals** (`signal()`, `computed()`, `effect()`) for all state — no RxJS `BehaviorSubject` for local state
- Use **`input()` / `output()`** functions, not `@Input` / `@Output` decorators
- Use **native control flow** (`@if`, `@for`, `@switch`) — not `*ngIf` / `*ngFor`
- Set `changeDetection: ChangeDetectionStrategy.OnPush` on every component
- Use **`inject()`** for dependency injection — not constructor injection
- Use **class bindings** — not `ngClass` or `ngStyle`
- Use **reactive forms** — not template-driven forms
- Avoid the `any` type; use `unknown` where the type is uncertain
- All components must pass AXE accessibility checks (WCAG AA minimum)

---

## Contributing

1. Fork the repository and create a feature branch (`git checkout -b feature/my-feature`)
2. Follow the coding standards above
3. Run the Angular linter: `cd frontend && ng lint`
4. Run the backend tests: `cd backend && mvn test`
5. Open a pull request against `main` with a clear description of the change

---

## Authors

Developed by the Thales Group  engineering team as part of an internal hackathon to modernise the ISRA toolchain.

---

## License

Internal use only. See `LICENSE` for terms.