#!/usr/bin/env node

const fs = require("fs/promises");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const config = require("./config");
const { ensureDir, flattenRecord, parseCsvList } = require("./utils");

function getArg(name) {
  const exact = process.argv.find((arg) => arg === `--${name}`);
  if (exact) {
    return true;
  }
  const prefix = `--${name}=`;
  const withValue = process.argv.find((arg) => arg.startsWith(prefix));
  if (!withValue) {
    return undefined;
  }
  return withValue.slice(prefix.length);
}

function resolveTypes() {
  const cliTypes = getArg("types");
  if (typeof cliTypes === "string") {
    return parseCsvList(cliTypes);
  }
  const envTypes = process.env.BUBBLE_TYPES;
  if (envTypes) {
    return parseCsvList(envTypes);
  }
  return config.supportedTypes;
}

function normalizeScalar(value) {
  if (value === undefined) {
    return null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }
  if (typeof value === "number") {
    return Number.isNaN(value) ? null : value;
  }
  if (typeof value === "boolean" || value === null) {
    return value;
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function writeJson(filePath, payload) {
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
}

function transformRecord(rawRecord) {
  const flattened = flattenRecord(rawRecord);
  const output = {};
  for (const [key, value] of Object.entries(flattened)) {
    output[key] = normalizeScalar(value);
  }
  return output;
}

async function main() {
  if (getArg("help")) {
    console.log(`
Usage: node scripts/bubble-migration/transform.js [--types=type1,type2]
`);
    return;
  }

  await ensureDir(config.normalizedDir);

  const types = resolveTypes();
  if (types.length === 0) {
    throw new Error("No types resolved for transform.");
  }

  for (const bubbleType of types) {
    const inputPath = path.join(config.rawDir, `${bubbleType}.json`);
    const outputPath = path.join(config.normalizedDir, `${bubbleType}.json`);

    try {
      const payload = await readJson(inputPath);
      const records = Array.isArray(payload.records) ? payload.records : [];
      const transformed = records.map(transformRecord);

      await writeJson(outputPath, {
        source: payload.source || { bubbleType },
        transformedAt: new Date().toISOString(),
        total: transformed.length,
        records: transformed,
      });

      console.log(`Transformed ${bubbleType}: ${transformed.length} -> ${outputPath}`);
    } catch (error) {
      console.error(`Failed to transform ${bubbleType}: ${error.message}`);
    }
  }
}

main().catch((error) => {
  console.error("Transform failed:", error);
  process.exit(1);
});
