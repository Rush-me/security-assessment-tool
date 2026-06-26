const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "..", "reports", "execution.log");

function write(level, message) {
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
  const line = `[${new Date().toISOString()}] [${level}] ${message}`;
  fs.appendFileSync(logFile, `${line}\n`, "utf8");
}

module.exports = {
  info: (msg) => write("INFO", msg),
  warn: (msg) => write("WARN", msg),
  error: (msg) => write("ERROR", msg)
};
