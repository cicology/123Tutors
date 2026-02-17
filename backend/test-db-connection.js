// Simple database connection test script
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Simple .env file parser (since dotenv might not be installed)
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
  }
}

loadEnv();

async function testConnection() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'tutor_dashboard',
  });

  try {
    console.log('Testing database connection...');
    console.log(`Host: ${client.host}`);
    console.log(`Port: ${client.port}`);
    console.log(`User: ${client.user}`);
    console.log(`Database: ${client.database}`);
    console.log('');

    await client.connect();
    console.log('✅ Successfully connected to PostgreSQL!');

    // Test query
    const result = await client.query('SELECT version()');
    console.log('✅ Database version:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);

    // Check if database exists and has tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    if (tablesResult.rows.length > 0) {
      console.log(`✅ Found ${tablesResult.rows.length} table(s) in database:`);
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('ℹ️  No tables found. Tables will be created automatically when you start the backend.');
    }

    await client.end();
    console.log('');
    console.log('✅ Database connection test passed!');
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Database connection failed!');
    console.error('');
    console.error('Error details:');
    console.error(error.message);
    console.error('');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Possible issues:');
      console.error('1. PostgreSQL is not running');
      console.error('   - Mac: brew services start postgresql@17');
      console.error('   - Check: pg_isready -h localhost -p 5432');
    } else if (error.code === '28P01') {
      console.error('Possible issues:');
      console.error('1. Incorrect username or password');
      console.error('2. Check your .env file credentials');
    } else if (error.code === '3D000') {
      console.error('Possible issues:');
      console.error('1. Database does not exist');
      console.error('2. Create it with: CREATE DATABASE tutor_dashboard;');
    } else {
      console.error('Check your .env file configuration:');
      console.error('  DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME');
    }
    
    process.exit(1);
  }
}

testConnection();

