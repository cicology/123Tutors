#!/usr/bin/env node

const fs = require("fs/promises");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const { createClient } = require("@supabase/supabase-js");
const config = require("./config");
const {
  parseBoolean,
  parseNumber,
  parseDate,
  parseCsvList,
  sanitizeKey,
} = require("./utils");

// Supabase configuration
const SUPABASE_URL = "https://dwhuhioxszupmxvgxhqb.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3aHVoaW94c3p1cG14dmd4aHFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjA0MDgyOSwiZXhwIjoyMDg3NjE2ODI5fQ.GU8zo3xJYB3X4b6KDkXMY_73SCjsgvBgH4rIoL9jdDU";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function getArg(name) {
  const exact = process.argv.find((arg) => arg === `--${name}`);
  if (exact) return true;
  const prefix = `--${name}=`;
  const withValue = process.argv.find((arg) => arg.startsWith(prefix));
  if (!withValue) return undefined;
  return withValue.slice(prefix.length);
}

function resolveMappings() {
  const cliTypes = getArg("types");
  const envTypes = process.env.BUBBLE_TYPES;
  const requested = typeof cliTypes === "string" ? parseCsvList(cliTypes) : parseCsvList(envTypes);
  if (requested.length === 0) return config.typeMappings;
  const requestedSet = new Set(requested);
  return config.typeMappings.filter((mapping) => requestedSet.has(mapping.bubbleType));
}

async function readNormalizedFile(bubbleType) {
  const filePath = path.join(config.normalizedDir, `${bubbleType}.json`);
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);
  const records = Array.isArray(parsed.records) ? parsed.records : [];
  return { filePath, records };
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

// Column definitions for each table (subset of columns we care about)
const tableColumns = {
  bank: ["unique_id", "bank_name", "branch_code", "creation_date", "modified_date", "slug", "creator"],
  bursary_names: ["unique_id", "address", "bursary_name", "creation_date", "modified_date", "slug", "creator", "logo", "description", "email", "phone", "website", "total_students", "total_budget", "year_established", "programs_offered", "primary_color", "secondary_color"],
  courses: ["unique_id", "institute_name", "module_code_name_search", "module_description", "module_year", "module_code", "module_name", "skill_category", "skill_name", "subject_name", "creation_date", "modified_date", "slug", "creator", "module_level", "module_credits"],
  school_names: ["unique_id", "school_type", "school_names", "creation_date", "modified_date", "slug", "creator"],
  tertiary_names: ["unique_id", "tertiary_name", "tertiary_codes", "tertiary_names_code", "creation_date", "modified_date", "slug", "creator"],
  tertiary_programmes: ["unique_id", "tertiary_programme", "creation_date", "modified_date", "slug", "creator"],
  tertiary_specializations: ["unique_id", "tertiary_specialization", "creation_date", "modified_date", "slug", "creator"],
  user_profiles: ["email", "user_type", "bursary_name", "creation_date", "modified_date", "slug", "creator", "unique_id", "profile_image_url", "logo_url"],
  tutor_requests: ["unique_id", "address_city", "address_country", "address_full", "address_province", "address_suburb_town", "all_courses_allocated", "courses_allocated_number", "request_courses", "request_courses_unallocated", "bursary_email", "bursary_name", "bursary_phone", "bursary_client_request_auto_approved", "bursary_debt", "contact_comments", "contact_sales", "contacted_sales_boolean", "contacted_type", "credited", "eft_paid", "total_amount", "platform_fee", "refund_amount", "refund_reason", "refunded", "extra_tutoring_requirements", "hourly_rate_list_text", "hours_list_text", "installment_payment", "installment_r", "installment_1_paid", "installment_2_paid", "installment_3_paid", "installment_paid_up", "institute_code", "institute_name", "institute_programme", "institute_specialization", "institute_student_year_of_study", "invoice_number", "language_1_main", "language_2_other", "learning_type", "marketing_meme_page_influencer", "marketing_feedback", "marketing_feedback_other", "new_system_request", "not_interested", "not_interested_comments", "request_delete", "paid", "paid_date", "responsible_for_payment", "promo_code", "promo_code_discount", "promo_code_discount_off_r", "promo_code_valid", "recipient_email", "recipient_first_name", "recipient_last_name", "recipient_phone_whatsapp", "recipient_whatsapp", "school_grade", "school_name", "school_syllabus", "school_syllabus_other", "school_type", "street_address", "student_email", "student_first_name", "student_gender", "student_last_name", "student_phone_whatsapp", "swapout", "tertiary_course_years_list_nums", "tertiary_study_guide_url", "tertiary_topics_list", "tutor_for", "tutoring_start_period", "tutoring_type", "tutors_assigned_list", "tutors_hourly_rate_list", "tutors_notified_num", "user_id", "user_type", "creation_date", "modified_date", "slug", "creator"]
};

function filterToTableColumns(record, tableName) {
  const columns = tableColumns[tableName] || [];
  const filtered = {};
  for (const col of columns) {
    if (record[col] !== undefined) {
      let value = record[col];
      // Clean up values
      if (value === "") value = null;
      if (typeof value === "string" && value.trim() === "") value = null;
      filtered[col] = value;
    }
  }
  return filtered;
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

async function processMapping(mapping, dryRun) {
  const { filePath, records } = await readNormalizedFile(mapping.bubbleType);

  const summary = {
    bubbleType: mapping.bubbleType,
    table: mapping.table,
    filePath,
    total: records.length,
    imported: 0,
    skipped: 0,
    errors: 0,
  };

  // Process in batches for efficiency
  const BATCH_SIZE = 100;
  const batches = [];

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const processedBatch = [];

    for (const rawRecord of batch) {
      const preprocessed = preprocessRecord(rawRecord, mapping);
      const row = filterToTableColumns(preprocessed, mapping.table);

      const requiredMissing = validateRequired(row, mapping.required);
      if (requiredMissing.length > 0) {
        summary.skipped += 1;
        continue;
      }

      if (!row[mapping.primaryKey]) {
        summary.skipped += 1;
        continue;
      }

      processedBatch.push(row);
    }

    if (processedBatch.length > 0) {
      batches.push(processedBatch);
    }
  }

  // Insert batches
  for (const batch of batches) {
    if (dryRun) {
      summary.imported += batch.length;
      continue;
    }

    try {
      const { data, error } = await supabase
        .from(mapping.table)
        .upsert(batch, {
          onConflict: mapping.primaryKey,
          ignoreDuplicates: false
        });

      if (error) {
        console.error(`[${mapping.bubbleType}] batch error: ${error.message}`);
        summary.errors += batch.length;
      } else {
        summary.imported += batch.length;
      }
    } catch (error) {
      console.error(`[${mapping.bubbleType}] batch failed: ${error.message}`);
      summary.errors += batch.length;
    }
  }

  return summary;
}

async function main() {
  if (getArg("help")) {
    console.log(`
Usage: node scripts/bubble-migration/load-supabase.js [--types=type1,type2] [--dry-run]

Uses Supabase REST API (HTTPS) instead of direct PostgreSQL connection.
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

  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Load mode: ${dryRun ? "DRY RUN" : "WRITE"}`);

  const summaries = [];
  for (const mapping of mappings) {
    try {
      const summary = await processMapping(mapping, dryRun);
      summaries.push(summary);
      console.log(
        `[${summary.bubbleType}] total=${summary.total} imported=${summary.imported} skipped=${summary.skipped} errors=${summary.errors}`
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
    { total: 0, imported: 0, skipped: 0, errors: 0 }
  );

  console.log(
    `Load complete: total=${totals.total} imported=${totals.imported} skipped=${totals.skipped} errors=${totals.errors}`
  );
}

main().catch((error) => {
  console.error("Load failed:", error);
  process.exit(1);
});
