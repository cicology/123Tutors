#!/usr/bin/env node

const fs = require("fs/promises");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const { Client } = require("pg");
const config = require("./config");
const {
  parseBoolean,
  parseNumber,
  parseDate,
  parseCsvList,
  resolveDbHost,
  sanitizeKey,
} = require("./utils");

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

function quoteIdentifier(identifier) {
  return `"${String(identifier).replace(/"/g, '""')}"`;
}

function resolveMappings() {
  const cliTypes = getArg("types");
  const envTypes = process.env.BUBBLE_TYPES;
  const requested = typeof cliTypes === "string" ? parseCsvList(cliTypes) : parseCsvList(envTypes);

  if (requested.length === 0) {
    return config.typeMappings;
  }

  const requestedSet = new Set(requested);
  return config.typeMappings.filter((mapping) => requestedSet.has(mapping.bubbleType));
}

function shouldUseSsl(host) {
  const value = String(host || "").toLowerCase();
  return (
    value.includes("render.com") ||
    value.includes("amazonaws.com") ||
    value.includes("heroku") ||
    value.includes("supabase.co") ||
    value.includes("supabase.com")
  );
}

function getHostFromConnectionString(connectionString) {
  if (!connectionString) {
    return "";
  }

  try {
    const normalized = String(connectionString).replace(/^postgres:\/\//i, "postgresql://");
    const url = new URL(normalized);
    return url.hostname || "";
  } catch {
    // Fall back to a basic parse that tolerates unescaped "@" in password by splitting on last "@"
    const raw = String(connectionString).replace(/^postgres(ql)?:\/\//i, "");
    const beforePath = raw.split("/")[0] || "";
    const hostPort = beforePath.includes("@") ? beforePath.slice(beforePath.lastIndexOf("@") + 1) : beforePath;
    return (hostPort.split(":")[0] || "").trim();
  }
}

async function createDbClient() {
  const connectionString = process.env.DATABASE_URL || process.env.DB_URL;
  if (connectionString) {
    const hostFromUrl = getHostFromConnectionString(connectionString);
    const client = new Client({
      connectionString,
      ssl: shouldUseSsl(hostFromUrl) ? { rejectUnauthorized: false } : false,
    });
    await client.connect();
    return client;
  }

  const host = resolveDbHost(process.env.DB_HOST || "localhost");
  const client = new Client({
    host,
    port: parseInt(process.env.DB_PORT || "5432", 10),
    user: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "postgres",
    ssl: shouldUseSsl(host) ? { rejectUnauthorized: false } : false,
  });
  await client.connect();
  return client;
}

async function readNormalizedFile(bubbleType) {
  const filePath = path.join(config.normalizedDir, `${bubbleType}.json`);
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);
  const records = Array.isArray(parsed.records) ? parsed.records : [];
  return { filePath, records };
}

async function getTableColumns(client, tableName) {
  const sql = `
    SELECT column_name, data_type, udt_name, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
  `;
  const result = await client.query(sql, [tableName]);
  const map = new Map();
  for (const row of result.rows) {
    map.set(row.column_name, row);
  }
  return map;
}

function applyAliases(record, aliases) {
  const next = { ...record };
  for (const [source, target] of Object.entries(aliases || {})) {
    if (next[target] === undefined || next[target] === null || next[target] === "") {
      const sourceValue = next[source];
      if (sourceValue !== undefined && sourceValue !== null && sourceValue !== "") {
        next[target] = sourceValue;
      }
    }
  }
  return next;
}

function preprocessRecord(rawRecord, mapping) {
  let record = {};
  for (const [key, value] of Object.entries(rawRecord || {})) {
    record[sanitizeKey(key)] = value;
  }

  record = applyAliases(record, config.globalAliases);
  record = applyAliases(record, mapping.aliases);

  if (mapping.table === "user_profiles") {
    if (!record.email && record.authentication_email_email) {
      record.email = record.authentication_email_email;
    }
    if (!record.email && record.authentication_google_email) {
      record.email = record.authentication_google_email;
    }
    if (!record.unique_id && record._id) {
      record.unique_id = record._id;
    }
    if (!record.user_type) {
      record.user_type = "user";
    }
  }

  if (mapping.table === "tutor_requests") {
    if (!record.unique_id && record._id) {
      record.unique_id = record._id;
    }

    if ((!record.student_first_name || !record.student_last_name) && record.student_name) {
      const parts = String(record.student_name).trim().split(/\s+/);
      if (!record.student_first_name && parts[0]) {
        record.student_first_name = parts[0];
      }
      if (!record.student_last_name && parts.length > 1) {
        record.student_last_name = parts.slice(1).join(" ");
      }
    }
  }

  return record;
}

function coerceValue(value, columnMeta) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === "string" && value.trim() === "") {
    return null;
  }

  const dataType = columnMeta.data_type;
  const udtName = columnMeta.udt_name;

  if (dataType === "boolean") {
    return parseBoolean(value);
  }

  if (["integer", "smallint", "bigint"].includes(dataType)) {
    return parseNumber(value, { integer: true });
  }

  if (["numeric", "decimal", "real", "double precision"].includes(dataType)) {
    return parseNumber(value, { integer: false });
  }

  if (dataType === "date") {
    return parseDate(value, { dateOnly: true });
  }

  if (dataType.includes("timestamp")) {
    return parseDate(value, { dateOnly: false });
  }

  if (["json", "jsonb"].includes(dataType)) {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }

  if (udtName && udtName.endsWith("[]")) {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [value];
      } catch {
        return [value];
      }
    }
    return [value];
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function buildUpsertSql(tableName, primaryKey, columns) {
  const quotedTable = quoteIdentifier(tableName);
  const quotedColumns = columns.map(quoteIdentifier);
  const placeholders = columns.map((_, index) => `$${index + 1}`);
  const updateColumns = columns.filter((column) => column !== primaryKey);

  let sql = `INSERT INTO ${quotedTable} (${quotedColumns.join(", ")}) VALUES (${placeholders.join(", ")})`;
  if (updateColumns.length === 0) {
    sql += ` ON CONFLICT (${quoteIdentifier(primaryKey)}) DO NOTHING`;
    return sql;
  }

  sql += ` ON CONFLICT (${quoteIdentifier(primaryKey)}) DO UPDATE SET `;
  sql += updateColumns
    .map((column) => `${quoteIdentifier(column)} = EXCLUDED.${quoteIdentifier(column)}`)
    .join(", ");

  return sql;
}

async function upsertRecord(client, tableName, primaryKey, row) {
  const columns = Object.keys(row);
  const values = columns.map((column) => row[column]);
  const sql = buildUpsertSql(tableName, primaryKey, columns);
  await client.query(sql, values);
}

function validateRequired(row, requiredColumns) {
  const missing = [];
  for (const column of requiredColumns || []) {
    const value = row[column];
    if (value === undefined || value === null || value === "") {
      missing.push(column);
    }
  }
  return missing;
}

async function processMapping(client, mapping, dryRun) {
  const { filePath, records } = await readNormalizedFile(mapping.bubbleType);
  const tableColumns = await getTableColumns(client, mapping.table);

  if (tableColumns.size === 0) {
    throw new Error(`Table ${mapping.table} not found in public schema.`);
  }

  const summary = {
    bubbleType: mapping.bubbleType,
    table: mapping.table,
    filePath,
    total: records.length,
    imported: 0,
    skipped: 0,
    errors: 0,
  };

  for (let index = 0; index < records.length; index += 1) {
    const rawRecord = records[index];
    const preprocessed = preprocessRecord(rawRecord, mapping);
    const row = {};

    for (const [key, value] of Object.entries(preprocessed)) {
      if (!tableColumns.has(key)) {
        continue;
      }
      const coerced = coerceValue(value, tableColumns.get(key));
      row[key] = coerced;
    }

    const requiredMissing = validateRequired(row, mapping.required);
    if (requiredMissing.length > 0) {
      summary.skipped += 1;
      continue;
    }

    if (!row[mapping.primaryKey]) {
      summary.skipped += 1;
      continue;
    }

    try {
      if (!dryRun) {
        await upsertRecord(client, mapping.table, mapping.primaryKey, row);
      }
      summary.imported += 1;
    } catch (error) {
      summary.errors += 1;
      console.error(
        `[${mapping.bubbleType}] row ${index + 1} failed: ${error.message} (pk=${row[mapping.primaryKey]})`,
      );
    }
  }

  return summary;
}

async function main() {
  if (getArg("help")) {
    console.log(`
Usage: node scripts/bubble-migration/load.js [--types=type1,type2] [--dry-run]

Environment variables:
  DATABASE_URL (or DB_URL), or DB_HOST/DB_PORT/DB_USERNAME/DB_PASSWORD/DB_DATABASE
  BUBBLE_TYPES      Optional comma list of Bubble types to load
  MIGRATION_DRY_RUN true/false (default false)
`);
    return;
  }

  const cliDryRun = getArg("dry-run") === true;
  const envDryRun = String(process.env.MIGRATION_DRY_RUN || "").toLowerCase() === "true";
  const dryRun = cliDryRun || envDryRun;
  const mappings = resolveMappings();

  if (mappings.length === 0) {
    throw new Error("No type mappings selected for load.");
  }

  const client = await createDbClient();
  try {
    console.log(`Connected to Postgres database: ${process.env.DB_DATABASE || "postgres"}`);
    console.log(`Load mode: ${dryRun ? "DRY RUN" : "WRITE"}`);

    const summaries = [];
    for (const mapping of mappings) {
      try {
        const summary = await processMapping(client, mapping, dryRun);
        summaries.push(summary);
        console.log(
          `[${summary.bubbleType}] total=${summary.total} imported=${summary.imported} skipped=${summary.skipped} errors=${summary.errors}`,
        );
      } catch (error) {
        console.error(`[${mapping.bubbleType}] failed: ${error.message}`);
      }
    }

    const totals = summaries.reduce(
      (acc, item) => {
        acc.total += item.total;
        acc.imported += item.imported;
        acc.skipped += item.skipped;
        acc.errors += item.errors;
        return acc;
      },
      { total: 0, imported: 0, skipped: 0, errors: 0 },
    );

    console.log(
      `Load complete: total=${totals.total} imported=${totals.imported} skipped=${totals.skipped} errors=${totals.errors}`,
    );
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Load failed:", error);
  process.exit(1);
});
