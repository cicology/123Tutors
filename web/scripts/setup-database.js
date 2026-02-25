#!/usr/bin/env node

const { spawnSync } = require("child_process");

console.log("Bootstrapping Supabase/Postgres schema from backend entities...");

const result = spawnSync(
  "npm",
  ["--prefix", "../backend", "run", "schema:bootstrap"],
  {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: true,
  },
);

if (result.status !== 0) {
  console.error("Schema bootstrap failed.");
  process.exit(result.status || 1);
}

console.log("Schema bootstrap complete.");
