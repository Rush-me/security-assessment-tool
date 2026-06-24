#!/usr/bin/env node
const { spawn } = require("child_process");

function parseArgs(argv) {
  const args = {
    tags: null,
    profile: null,
    parallel: null,
    retry: null,
    dryRun: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (token === "--tags" && argv[i + 1]) {
      args.tags = argv[i + 1];
      i += 1;
      continue;
    }

    if (token === "--profile" && argv[i + 1]) {
      args.profile = argv[i + 1];
      i += 1;
      continue;
    }

    if (token === "--parallel" && argv[i + 1]) {
      args.parallel = argv[i + 1];
      i += 1;
      continue;
    }

    if (token === "--retry" && argv[i + 1]) {
      args.retry = argv[i + 1];
      i += 1;
      continue;
    }

    if (token === "--dry-run") {
      args.dryRun = true;
    }
  }

  return args;
}

function profileToTags(profile) {
  if (!profile) return null;
  const map = {
    smoke: "@smoke",
    sanity: "@sanity",
    regression: "@regression",
    p0: "@p0",
    p1: "@p1",
    p2: "@p2"
  };
  return map[profile] || null;
}

function run() {
  const cli = parseArgs(process.argv.slice(2));
  const tags = cli.tags || profileToTags(cli.profile);

  const cucumberArgs = ["cucumber-js", "--config", "cucumber.js"];

  if (tags) {
    cucumberArgs.push("--tags", tags);
  }

  if (cli.parallel) {
    cucumberArgs.push("--parallel", String(cli.parallel));
  }

  if (cli.retry) {
    cucumberArgs.push("--retry", String(cli.retry));
  }

  if (cli.dryRun) {
    cucumberArgs.push("--dry-run");
  }

  const child = spawn("npx", cucumberArgs, {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      ...(cli.parallel ? { CUCUMBER_PARALLEL: String(cli.parallel) } : {}),
      ...(cli.retry ? { CUCUMBER_RETRY: String(cli.retry) } : {})
    }
  });

  child.on("close", (code) => {
    process.exit(code ?? 1);
  });
}

run();
