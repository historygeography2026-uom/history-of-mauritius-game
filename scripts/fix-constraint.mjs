#!/usr/bin/env node

import pg from "pg";
import fs from "fs";
import path from "path";

// Read .env.local
const envPath = path.join(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");

// Parse environment variables
const envVars = {};
envContent.split("\n").forEach((line) => {
  if (line && !line.startsWith("#")) {
    const [key, ...valueParts] = line.split("=");
    envVars[key.trim()] = valueParts.join("=").trim().replace(/^"/, "").replace(/"$/, "");
  }
});

const postgresUrl = envVars.POSTGRES_URL;

if (!postgresUrl) {
  console.error("❌ Missing POSTGRES_URL in .env.local");
  process.exit(1);
}

// Clean up the connection string
let cleanUrl = postgresUrl
  .replace("?sslmode=require&supa=base-pooler.x", "")
  .replace("?sslmode=require&pgbouncer=true", "");

const client = new pg.Client({
  connectionString: cleanUrl,
  ssl: {
    rejectUnauthorized: false,
    ca: undefined,
  },
});

async function fixConstraint() {
  try {
    await client.connect();
    console.log("🔧 Updating check_created_by constraint...\n");

    // Drop the old constraint
    await client.query(`
      ALTER TABLE questions DROP CONSTRAINT IF EXISTS check_created_by
    `);
    console.log("✅ Old constraint dropped");

    // Add the new constraint with MES, MAI, and MIE
    await client.query(`
      ALTER TABLE questions
      ADD CONSTRAINT check_created_by
      CHECK (created_by IN ('MES', 'MAI', 'MIE'))
    `);
    console.log("✅ New constraint added with MES, MAI, MIE values");

    // Verify
    const result = await client.query(`
      SELECT
        c.conname as constraint_name,
        pg_get_constraintdef(c.oid) as constraint_def
      FROM pg_constraint c
      JOIN pg_class r ON r.oid = c.conrelid
      WHERE c.conname = 'check_created_by'
    `);

    if (result.rows.length > 0) {
      console.log(`\n📋 New constraint definition:`);
      console.log(`   ${result.rows[0].constraint_def}\n`);
      console.log("✅ Constraint successfully updated!");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.end();
  }
}

fixConstraint();
