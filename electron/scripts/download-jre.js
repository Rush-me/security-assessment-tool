#!/usr/bin/env node
/**
 * scripts/download-jre.js
 *
 * Downloads Eclipse Temurin JRE 17 from Adoptium for the current platform
 * and extracts it into electron/jre/  — which electron-builder then bundles
 * as an extraResource inside the installer.
 *
 * Usage:
 *   node scripts/download-jre.js                   # auto-detect platform
 *   node scripts/download-jre.js --platform win32  # cross-compile
 *
 * Supported platforms: win32, linux, darwin
 * Architecture:        x64, arm64
 */

'use strict';

const fs       = require('fs');
const path     = require('path');
const https    = require('https');
const { execSync } = require('child_process');

// ── Parse args ────────────────────────────────────────────────────────────────
const args     = process.argv.slice(2);
const argMap   = {};
args.forEach((a, i) => { if (a.startsWith('--')) argMap[a.slice(2)] = args[i + 1] || true; });

const platform = argMap.platform || process.platform;  // win32 | linux | darwin
const arch     = argMap.arch     || process.arch;      // x64 | arm64

// ── Adoptium API parameters ───────────────────────────────────────────────────
const JRE_VERSION       = '17';
const JRE_IMAGE_TYPE    = 'jre';

const platformMap = { win32: 'windows', linux: 'linux', darwin: 'mac' };
const archMap     = { x64: 'x64', arm64: 'aarch64' };

const apiOs   = platformMap[platform] || platform;
const apiArch = archMap[arch] || arch;
const ext     = platform === 'win32' ? 'zip' : 'tar.gz';

const ADOPTIUM_URL = `https://api.adoptium.net/v3/binary/latest/${JRE_VERSION}/ga/${apiOs}/${apiArch}/${JRE_IMAGE_TYPE}/hotspot/normal/eclipse?project=jdk`;

const JRE_DIR = path.join(__dirname, '..', 'jre');

// ── Already present? ──────────────────────────────────────────────────────────
if (fs.existsSync(JRE_DIR) && fs.readdirSync(JRE_DIR).length > 0) {
  console.log(`✔  JRE already present at: ${JRE_DIR}`);
  process.exit(0);
}

fs.mkdirSync(JRE_DIR, { recursive: true });

// ── Download helper (follows redirects) ───────────────────────────────────────
function download(url, destPath, redirects = 0) {
  if (redirects > 10) throw new Error('Too many redirects');
  return new Promise((resolve, reject) => {
    console.log(`⬇  Downloading: ${url}`);
    https.get(url, { headers: { 'User-Agent': 'isra-jre-downloader' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(download(res.headers.location, destPath, redirects + 1));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      }
      const total = parseInt(res.headers['content-length'] || '0', 10);
      let received = 0;
      const file = fs.createWriteStream(destPath);
      res.on('data', (chunk) => {
        received += chunk.length;
        if (total > 0) {
          process.stdout.write(`   ${Math.round(received / total * 100)}%\r`);
        }
      });
      res.pipe(file);
      file.on('finish', () => { file.close(); console.log('\n✔  Download complete'); resolve(); });
      file.on('error', reject);
    }).on('error', reject);
  });
}

// ── Extract helper ────────────────────────────────────────────────────────────
function extract(archivePath, destDir) {
  console.log(`📦  Extracting ${archivePath} → ${destDir}`);
  if (archivePath.endsWith('.zip')) {
    // Use unzip (available on Windows via WSL, or use decompress library)
    try {
      execSync(`unzip -q "${archivePath}" -d "${destDir}"`);
    } catch {
      // Fallback: use decompress (installed as devDep)
      const decompress = require('decompress');
      const decompressUnzip = require('decompress-unzip');
      return decompress(archivePath, destDir, { plugins: [decompressUnzip()] });
    }
  } else {
    execSync(`tar -xzf "${archivePath}" -C "${destDir}"`);
  }
  console.log('✔  Extraction complete');
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  const archiveName = `temurin-jre17-${apiOs}-${apiArch}.${ext}`;
  const archivePath = path.join(JRE_DIR, archiveName);

  try {
    console.log(`\n🔧  Eclipse Temurin JRE ${JRE_VERSION} — ${apiOs}/${apiArch}`);
    await download(ADOPTIUM_URL, archivePath);
    await extract(archivePath, JRE_DIR);

    // Remove archive after extraction
    fs.unlinkSync(archivePath);

    console.log(`\n✅  JRE ready at: ${JRE_DIR}`);
    console.log('   Contents:', fs.readdirSync(JRE_DIR));
  } catch (err) {
    console.error('\n❌  Failed to download/extract JRE:', err.message);
    process.exit(1);
  }
})();
