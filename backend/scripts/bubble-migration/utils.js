const fs = require("fs/promises");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

function sanitizeKey(raw) {
  if (raw === null || raw === undefined) {
    return "field";
  }

  return String(raw)
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "") || "field";
}

function assignPreferred(target, key, value) {
  const current = target[key];
  const currentMissing = current === undefined || current === null || current === "";
  if (currentMissing) {
    target[key] = value;
  }
}

function flattenRecord(input, prefix = "", out = {}) {
  if (input === null || input === undefined) {
    return out;
  }

  if (Array.isArray(input)) {
    if (prefix) {
      assignPreferred(out, prefix, JSON.stringify(input));
    }
    return out;
  }

  if (typeof input !== "object") {
    if (prefix) {
      assignPreferred(out, prefix, input);
    }
    return out;
  }

  for (const [rawKey, rawValue] of Object.entries(input)) {
    const keyPart = sanitizeKey(rawKey);
    const pathKey = prefix ? `${prefix}_${keyPart}` : keyPart;

    if (rawValue === null || rawValue === undefined) {
      assignPreferred(out, pathKey, null);
      continue;
    }

    if (Array.isArray(rawValue)) {
      assignPreferred(out, pathKey, JSON.stringify(rawValue));
      continue;
    }

    if (typeof rawValue === "object") {
      flattenRecord(rawValue, pathKey, out);
      continue;
    }

    assignPreferred(out, pathKey, rawValue);
  }

  return out;
}

function parseBoolean(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(normalized)) {
    return true;
  }
  if (["false", "0", "no", "n"].includes(normalized)) {
    return false;
  }
  return null;
}

function parseNumber(value, { integer = false } = {}) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value === "number") {
    if (Number.isNaN(value)) {
      return null;
    }
    return integer ? Math.trunc(value) : value;
  }
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  if (!cleaned) {
    return null;
  }
  const parsed = integer ? parseInt(cleaned, 10) : parseFloat(cleaned);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseDate(value, { dateOnly = false } = {}) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  if (dateOnly) {
    return parsed.toISOString().slice(0, 10);
  }
  return parsed.toISOString();
}

function parseCsvList(input) {
  if (!input) {
    return [];
  }
  return String(input)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function resolveDbHost(rawHost) {
  if (!rawHost || !rawHost.includes("jdbc:postgresql://")) {
    return rawHost;
  }
  const match = rawHost.match(/jdbc:postgresql:\/\/([^:/]+)/);
  return match?.[1] || rawHost;
}

module.exports = {
  sleep,
  ensureDir,
  sanitizeKey,
  flattenRecord,
  parseBoolean,
  parseNumber,
  parseDate,
  parseCsvList,
  resolveDbHost,
};

