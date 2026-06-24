# ISRA 2.0 — Developer Setup & Running in Dev Mode

---

## Project Structure

```
isra/
├── electron/               ← Electron shell (main.js, splash.html, preload.js)
│   ├── main.js
│   ├── splash.html
│   ├── preload.js
│   ├── assets/
│   │   └── icon.png
│   ├── scripts/
│   │   ├── build.js
│   │   └── download-jre.js
│   ├── builder-config.yml
│   └── package.json        ← Electron's package.json (npm commands run here)
├── frontend/               ← Angular app
│   ├── src/
│   ├── angular.json
│   └── package.json
└── backend/                ← Spring Boot app
    ├── src/
    ├── pom.xml
    └── target/             ← Built jar lands here after mvn package
        └── security-risk-assessment-tool.jar
```

---

## Prerequisites

Make sure these are installed before anything else:

| Tool | Version | Check |
|------|---------|-------|
| Java (OpenJDK) | 17+ | `java -version` |
| Maven | 3.8+ | `mvn -version` |
| Node.js | 18+ | `node -version` |
| npm | 9+ | `npm -version` |
| Angular CLI | 17+ | `ng version` |

---

## One-Time Setup

Run these once after cloning the repo.

**1. Install Electron dependencies:**
```bash
cd isra/electron
npm install
```

**2. Install Angular dependencies:**
```bash
cd isra/frontend
npm install
```

**3. Set your Gemini API key (optional — only needed for AI suggestions):**
```bash
export ISRA_AI_API_KEY=AIzaSy...your-key-here
```

> Without this the app runs in full manual mode with AI suggestions disabled — that is expected and not an error.

---

## Running in Dev Mode

Dev mode requires **two terminals**. Start them in order.

---

### Step 1 — Build the Spring Boot JAR (Terminal 1)

```bash
cd isra/backend
mvn clean package -DskipTests
```

Wait for:
```
BUILD SUCCESS
```

The JAR is now at `backend/target/security-risk-assessment-tool.jar`.
Electron will pick it up automatically — **no need to run it manually**.

> Only rebuild the JAR when you change Java code. Angular or Electron changes do not require a rebuild.

---

### Step 2 — Start the Angular dev server (Terminal 1 or new terminal)

```bash
cd isra/frontend
ng serve --port 4200
```

Wait for:
```
✔ Compiled successfully
```

> Angular auto hot-reloads on any `.ts` / `.html` / `.scss` change — no restart needed.

---

### Step 3 — Launch Electron (Terminal 2)

```bash
cd isra/electron

# Optional: set Gemini key if you want AI suggestions
export ISRA_AI_API_KEY=AIzaSy...your-key-here

npm run electron:dev
```

What happens automatically:
1. Splash screen appears immediately
2. Electron finds a free port dynamically (e.g. `43017`)
3. Electron spawns Spring Boot from `backend/target/` on that port
4. Once Spring Boot is ready, Electron loads `http://localhost:4200`
5. Splash closes, main window appears

---

## What Triggers a Restart

| Layer | Changed file | Action needed |
|-------|-------------|---------------|
| Spring Boot | Any `.java` file | Re-run `mvn clean package -DskipTests`, then restart Electron |
| Angular | Any `.ts` / `.html` / `.scss` | Nothing — auto hot-reloads |
| Electron | `main.js` / `preload.js` / `splash.html` | Restart `npm run electron:dev` |

---

## Verifying Everything Works

**Find the dynamic port** Electron allocated:
```bash
tail -20 ~/.config/SecurityRiskAssessmentTool/logs/electron.log
# Look for: Allocated dynamic port: 43017
#           Backend ready on port 43017
```

**Check the backend is responding:**
```bash
curl http://127.0.0.1:<port>/api/projects
# Expected: [] or a list of projects

curl http://127.0.0.1:<port>/api/ai/status
# Expected: {"status":"not-configured",...} or {"status":"available",...}
```

**Check the AI badge in the app header:**

| Badge | Meaning |
|-------|---------|
| 🟢 AI Available | Key is set, internet reachable, suggestions enabled |
| ⚪ Offline | Key is set but no internet — manual mode only |
| ⚪ AI Not Configured | No key set — expected if you skipped Step 3 of setup |

---

## Logs

```
~/.config/SecurityRiskAssessmentTool/logs/
├── electron.log   ← Port allocation, backend spawn, window lifecycle
└── backend.log    ← Spring Boot output, API calls, Gemini errors
```

Tail live while the app is running:
```bash
tail -f ~/.config/SecurityRiskAssessmentTool/logs/electron.log
tail -f ~/.config/SecurityRiskAssessmentTool/logs/backend.log
```

---

## application.properties Quick Reference

```properties
# Server — leave as plain value; Electron overrides via -Dserver.port= at runtime
server.port=8080

# H2 file database
spring.datasource.url=jdbc:h2:file:${app.data.dir}/isra-db;AUTO_SERVER=TRUE
spring.datasource.driver-class-name=org.h2.Driver

# Gemini AI — set via env var, never hardcode here
isra.ai.api-key=${ISRA_AI_API_KEY:}
isra.ai.model=gemini-2.5-flash
isra.ai.base-url=https://generativelanguage.googleapis.com
isra.ai.health-check-url=https://generativelanguage.googleapis.com
```

---

## Building for Distribution

When ready to produce a real installer:

```bash
# 1. Build the Spring Boot jar
cd isra/backend && mvn clean package -DskipTests

# 2. Build Angular for production
cd isra/frontend && ng build --configuration production

# 3. Download bundled JRE (so end users don't need Java installed)
cd isra/electron && npm run download-jre

# 4. Package for your platform
npm run dist:linux    # .AppImage / .deb
npm run dist:win      # .exe installer
npm run dist:mac      # .dmg
```

The packaged app bundles the JRE + Spring Boot jar + Angular dist into a
single self-contained installer. End users need nothing pre-installed.
