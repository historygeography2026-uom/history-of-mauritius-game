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

async function checkConstraint() {
  try {
    await client.connect();
    console.log("🔍 Checking constraint definition in database...\n");

    // Get constraint definition
    const result = await client.query(`
      SELECT
        t.tablename,
        c.conname as constraint_name,
        pg_get_constraintdef(c.oid) as constraint_def
      FROM pg_constraint c
      JOIN pg_class r ON r.oid = c.conrelid
      JOIN pg_tables t ON t.tablename = r.relname
      WHERE c.conname = 'check_created_by' AND t.schemaname = 'public'
    `);

    if (result.rows.length === 0) {
      console.log("❌ Constraint 'check_created_by' NOT FOUND in database!");
      return;
    }

    const constraint = result.rows[0];
    console.log("📋 Constraint Definition:");
    console.log(`   Table: ${constraint.tablename}`);
    console.log(`   Name: ${constraint.constraint_name}`);
    console.log(`   Definition: ${constraint.constraint_def}\n`);

    // Check RLS status
    const rlsResult = await client.query(`
      SELECT tablename, relrowsecurity
      FROM pg_tables
      JOIN pg_class ON pg_class.relname = tablename
      WHERE tablename = 'questions' AND schemaname = 'public'
    `);

    if (rlsResult.rows.length > 0) {
      const rls = rlsResult.rows[0];
      console.log("🔒 RLS Status on questions table:");
      console.log(`   RLS Enabled: ${rls.relrowsecurity}\n`);
    }

    // Check actual values in created_by column
    const valuesResult = await client.query(`
      SELECT DISTINCT created_by, COUNT(*) as count
      FROM questions
      GROUP BY created_by
      ORDER BY created_by
    `);

    console.log("📊 Values in created_by column:");
    for (const row of valuesResult.rows) {
      console.log(`   '${row.created_by}': ${row.count} rows`);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.end();
  }
}

checkConstraint();
