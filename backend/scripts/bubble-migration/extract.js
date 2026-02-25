#!/usr/bin/env node

const fs = require("fs/promises");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const config = require("./config");
const { ensureDir, sleep, parseCsvList } = require("./utils");

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

function getTypesFromConfigOrEnv(metaTypes = []) {
  const cliTypes = getArg("types");
  if (typeof cliTypes === "string") {
    return parseCsvList(cliTypes);
  }
  const envTypes = process.env.BUBBLE_TYPES;
  if (envTypes) {
    return parseCsvList(envTypes);
  }
  if (config.supportedTypes.length > 0) {
    return config.supportedTypes;
  }
  if (metaTypes.length > 0) {
    return metaTypes;
  }
  return [];
}

async function requestJson(url, options = {}) {
  const retries = parseInt(process.env.BUBBLE_RETRIES || String(config.defaultRetries), 10);
  const baseDelayMs = parseInt(process.env.BUBBLE_DELAY_MS || String(config.defaultDelayMs), 10);
  const token = process.env.BUBBLE_API_TOKEN;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const headers = {
        Accept: "application/json",
        ...(options.headers || {}),
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`HTTP ${response.status} for ${url}: ${body.slice(0, 240)}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt >= retries) {
        throw error;
      }
      const backoffMs = baseDelayMs * attempt;
      console.warn(`Request failed (attempt ${attempt}/${retries}). Retrying in ${backoffMs}ms...`);
      await sleep(backoffMs);
    }
  }

  throw new Error(`Unreachable retry state for URL: ${url}`);
}

async function fetchMeta(baseUrl) {
  const url = `${baseUrl.replace(/\/$/, "")}/api/1.1/meta`;
  return requestJson(url);
}

async function fetchTypeRecords(baseUrl, bubbleType) {
  const pageSize = parseInt(process.env.BUBBLE_PAGE_SIZE || String(config.defaultPageSize), 10);
  const delayMs = parseInt(process.env.BUBBLE_DELAY_MS || String(config.defaultDelayMs), 10);
  const maxPages = parseInt(process.env.BUBBLE_MAX_PAGES || "10000", 10);
  const records = [];
  let cursor = 0;
  let page = 0;

  while (page < maxPages) {
    page += 1;
    const params = new URLSearchParams({
      limit: String(pageSize),
      cursor: String(cursor),
    });
    const url = `${baseUrl.replace(/\/$/, "")}/api/1.1/obj/${encodeURIComponent(bubbleType)}?${params.toString()}`;
    const payload = await requestJson(url);
    const response = payload?.response || {};
    const pageRecords = Array.isArray(response.results) ? response.results : [];
    const remaining = Number(response.remaining || 0);

    records.push(...pageRecords);
    cursor += pageRecords.length;

    console.log(
      `[${bubbleType}] page=${page} fetched=${pageRecords.length} total=${records.length} remaining=${remaining}`,
    );

    if (pageRecords.length === 0 || remaining <= 0) {
      break;
    }

    if (delayMs > 0) {
      await sleep(delayMs);
    }
  }

  return records;
}

async function writeJson(filePath, payload) {
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
}

async function main() {
  if (getArg("help")) {
    console.log(`
Usage: node scripts/bubble-migration/extract.js [--types=type1,type2]

Environment variables:
  BUBBLE_BASE_URL      Bubble base URL (default: ${config.defaultBubbleBaseUrl})
  BUBBLE_TYPES         Comma list of Bubble object types to extract
  BUBBLE_API_TOKEN     Optional Bubble API token
  BUBBLE_PAGE_SIZE     Pagination size (default: ${config.defaultPageSize})
  BUBBLE_DELAY_MS      Delay between pages in ms (default: ${config.defaultDelayMs})
  BUBBLE_RETRIES       Retry attempts (default: ${config.defaultRetries})
`);
    return;
  }

  const baseUrl = process.env.BUBBLE_BASE_URL || config.defaultBubbleBaseUrl;
  await ensureDir(config.rawDir);

  console.log(`Bubble source: ${baseUrl}`);
  console.log(`Raw output dir: ${config.rawDir}`);

  let meta = null;
  try {
    meta = await fetchMeta(baseUrl);
    const metaPath = path.join(config.rawDir, "meta.json");
    await writeJson(metaPath, meta);
    console.log(`Saved meta -> ${metaPath}`);
  } catch (error) {
    console.warn(`Meta fetch failed: ${error.message}`);
  }

  const metaTypes = Array.isArray(meta?.get) ? meta.get : [];
  const types = getTypesFromConfigOrEnv(metaTypes);

  if (types.length === 0) {
    throw new Error("No Bubble types resolved. Set BUBBLE_TYPES or ensure /api/1.1/meta is reachable.");
  }

  for (const bubbleType of types) {
    try {
      const records = await fetchTypeRecords(baseUrl, bubbleType);
      const output = {
        source: {
          bubbleType,
          baseUrl,
          exportedAt: new Date().toISOString(),
          total: records.length,
        },
        records,
      };
      const outputPath = path.join(config.rawDir, `${bubbleType}.json`);
      await writeJson(outputPath, output);
      console.log(`Saved ${bubbleType}: ${records.length} records -> ${outputPath}`);
    } catch (error) {
      console.error(`Failed to extract ${bubbleType}: ${error.message}`);
    }
  }
}

main().catch((error) => {
  console.error("Extraction failed:", error);
  process.exit(1);
});
