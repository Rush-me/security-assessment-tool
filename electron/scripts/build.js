#!/usr/bin/env node
/**
 * scripts/build.js
 *
 * Orchestrates the complete build pipeline:
 *   1. Build Angular frontend
 *   2. Build Spring Boot backend JAR
 *   3. Download bundled JRE (if not present)
 *   4. Launch Electron dev or trigger electron-builder for production
 *
 * Usage:
 *   node scripts/build.js --dev     → Dev mode (launch Electron directly)
 *   node scripts/build.js --prod    → Production build (all platforms)
 *   node scripts/build.js --win     → Windows installer only
 *   node scripts/build.js --linux   → Linux installers only
 *   node scripts/build.js --mac     → macOS installers only
 */

'use strict';

const { execSync, spawn } = require('child_process');
const path  = require('path');
const fs    = require('fs');
const args  = process.argv.slice(2);

const ROOT     = path.resolve(__dirname, '..', '..');
const ELECTRON = path.resolve(__dirname, '..');

const isDev  = args.includes('--dev');
const isProd = args.includes('--prod') || args.includes('--win') || args.includes('--linux') || args.includes('--mac');

function run(cmd, cwd, label) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`▶  [${label}] ${cmd}`);
  console.log('─'.repeat(60));
  execSync(cmd, { cwd, stdio: 'inherit' });
}

function header(text) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`   ${text}`);
  console.log('═'.repeat(60));
}

// ── Step 1: Build Angular frontend (only in production) ───────────────────────
function buildFrontend() {
  header('Building Angular Frontend');
  run('npm run build:electron', path.join(ROOT, 'frontend'), 'Angular');
}

// ── Step 2: Build Spring Boot JAR ────────────────────────────────────────────
function buildBackend() {
  header('Building Spring Boot Backend');
  run('mvn clean package -DskipTests', path.join(ROOT, 'backend'), 'Maven');
}

// ── Step 3: Download JRE ──────────────────────────────────────────────────────
function downloadJre() {
  header('Downloading Bundled JRE');
  run('node scripts/download-jre.js', ELECTRON, 'JRE');
}

// ── Step 4a: Dev mode ─────────────────────────────────────────────────────────
function runDev() {
  header('Launching Electron (Dev)');
  console.log('  Angular dev server must be running: cd frontend && npm start');
  const electron = require('electron');
  const proc = spawn(electron, ['.'], {
    cwd: ELECTRON,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });
  proc.on('exit', (code) => process.exit(code || 0));
}

// ── Step 4b: Production dist ──────────────────────────────────────────────────
function buildDist() {
  header('Packaging with electron-builder');
  let targets = '';
  if (args.includes('--win'))   targets = '--win';
  if (args.includes('--linux')) targets = '--linux';
  if (args.includes('--mac'))   targets = '--mac';
  // --prod without specific platform → build for current OS
  run(`npx electron-builder ${targets}`.trim(), ELECTRON, 'electron-builder');
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  header('Thales ISRA — Build Pipeline');
  console.log(`  Mode : ${isDev ? 'Development' : 'Production'}`);
  console.log(`  Args : ${args.join(' ') || '(none)'}`);

  if (isDev) {
    // In dev mode, do NOT rebuild everything — just launch Electron
    runDev();
    return;
  }

  if (!isProd) {
    console.error('❌  No mode specified. Use --dev or --prod (or --win / --linux / --mac)');
    process.exit(1);
  }

  try {
    buildFrontend();
    buildBackend();
    downloadJre();
    buildDist();
    header('✅  Build Complete!');
    console.log(`\n  Installers are in: ${path.join(ELECTRON, 'dist')}\n`);
  } catch (err) {
    console.error('\n❌  Build failed:', err.message);
    process.exit(1);
  }
})();
