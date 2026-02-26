#!/usr/bin/env node

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const { randomBytes } = require('crypto');

function getArg(name) {
  const exact = process.argv.find((arg) => arg === `--${name}`);
  if (exact) return true;
  const prefix = `--${name}=`;
  const withValue = process.argv.find((arg) => arg.startsWith(prefix));
  if (!withValue) return undefined;
  return withValue.slice(prefix.length);
}

function getPgClient() {
  const connectionString = process.env.DATABASE_URL || process.env.DB_URL;
  if (connectionString) {
    return new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
  }

  return new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'postgres',
    ssl: { rejectUnauthorized: false },
  });
}

function isAlreadyExistsError(message) {
  const normalized = String(message || '').toLowerCase();
  return (
    normalized.includes('already') ||
    normalized.includes('exists') ||
    normalized.includes('registered') ||
    normalized.includes('been invited')
  );
}

async function main() {
  if (getArg('help')) {
    console.log(`
Usage:
  node scripts/supabase-auth/provision-auth-users.js [--dry-run] [--mode=invite|password] [--limit=1000] [--offset=0]

Environment required:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY

Defaults:
  mode   = invite
  limit  = 1000000
  offset = 0
`);
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.SUPABASE_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }

  const dryRun = getArg('dry-run') === true;
  const mode = String(getArg('mode') || process.env.AUTH_PROVISION_MODE || 'invite').toLowerCase();
  if (!['invite', 'password'].includes(mode)) {
    throw new Error(`Invalid mode "${mode}". Use invite or password.`);
  }

  const limit = Number(getArg('limit') || process.env.AUTH_PROVISION_LIMIT || 1000000);
  const offset = Number(getArg('offset') || process.env.AUTH_PROVISION_OFFSET || 0);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const pgClient = getPgClient();
  await pgClient.connect();
  try {
    const users = await pgClient.query(
      `
      select email, unique_id, user_type
      from public.user_profiles
      where email is not null and email <> ''
      order by email
      limit $1
      offset $2
      `,
      [limit, offset],
    );

    const summary = {
      total: users.rowCount,
      created: 0,
      invited: 0,
      skipped: 0,
      errors: 0,
    };

    console.log(
      `Supabase auth provision start: mode=${mode} dryRun=${dryRun} users=${summary.total} limit=${limit} offset=${offset}`,
    );

    for (let i = 0; i < users.rows.length; i += 1) {
      const row = users.rows[i];
      const email = String(row.email || '').trim().toLowerCase();
      if (!email) {
        summary.skipped += 1;
        continue;
      }

      if (dryRun) {
        summary.skipped += 1;
        continue;
      }

      try {
        let error = null;
        if (mode === 'invite') {
          const result = await supabase.auth.admin.inviteUserByEmail(email, {
            data: {
              unique_id: row.unique_id,
              user_type: row.user_type || 'user',
              migrated_from: 'bubble',
            },
          });
          error = result.error;
          if (!error) {
            summary.invited += 1;
          }
        } else {
          const tempPassword = randomBytes(18).toString('base64url');
          const result = await supabase.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
              unique_id: row.unique_id,
              user_type: row.user_type || 'user',
              migrated_from: 'bubble',
            },
          });
          error = result.error;
          if (!error) {
            summary.created += 1;
          }
        }

        if (error) {
          if (isAlreadyExistsError(error.message)) {
            summary.skipped += 1;
          } else {
            summary.errors += 1;
            console.error(`[${i + 1}/${summary.total}] ${email} -> ${error.message}`);
          }
        }
      } catch (error) {
        summary.errors += 1;
        console.error(`[${i + 1}/${summary.total}] ${email} -> ${error.message}`);
      }

      if ((i + 1) % 200 === 0) {
        console.log(
          `Progress: ${i + 1}/${summary.total} invited=${summary.invited} created=${summary.created} skipped=${summary.skipped} errors=${summary.errors}`,
        );
      }
    }

    console.log(
      `Supabase auth provision complete: total=${summary.total} invited=${summary.invited} created=${summary.created} skipped=${summary.skipped} errors=${summary.errors}`,
    );
  } finally {
    await pgClient.end();
  }
}

main().catch((error) => {
  console.error('Provision failed:', error.message);
  process.exit(1);
});

