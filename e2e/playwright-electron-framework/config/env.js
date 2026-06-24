const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const repoRoot = path.resolve(__dirname, "..", "..", "..");

module.exports = {
  appName: process.env.APP_NAME || "ISRA 2.0",
  electronMainPath:
    process.env.ELECTRON_MAIN_PATH ||
    path.join(repoRoot, "electron", "main.js"),
  backendBaseUrl: process.env.BACKEND_BASE_URL || "http://127.0.0.1:8080",
  apiTimeoutMs: Number(process.env.API_TIMEOUT_MS || 30000),
  authUser: process.env.AUTH_USER || "testuser",
  authPassword: process.env.AUTH_PASSWORD || "TestPass123!",
  artifactDir: path.join(__dirname, "..", "reports"),
  screenshotDir: path.join(__dirname, "..", "screenshots"),
  traceDir: path.join(__dirname, "..", "traces"),
  videoDir: path.join(__dirname, "..", "videos")
};
