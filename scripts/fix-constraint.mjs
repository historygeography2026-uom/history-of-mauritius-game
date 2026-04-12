#!/usr/bin/env node

import { config } from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import { Pool } from "pg"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.join(__dirname, "..", ".env.local") })

const connectionString = process.env.DATABASE_URL_EXTERNAL || process.env.DATABASE_URL

if (!connectionString) {
  console.error("❌ Missing DATABASE_URL or DATABASE_URL_EXTERNAL")
  process.exit(1)
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

async function fixConstraint() {
  try {
    console.log("🔧 Updating check_created_by constraint to match the current app...\n")

    await pool.query(`
      ALTER TABLE questions DROP CONSTRAINT IF EXISTS check_created_by
    `)
    console.log("✅ Old constraint dropped")

    await pool.query(`
      ALTER TABLE questions
      ADD CONSTRAINT check_created_by
      CHECK (created_by IN ('MES', 'MIE'))
    `)
    console.log("✅ New constraint added: CHECK (created_by IN ('MES', 'MIE'))")

    await pool.query(`
      ALTER TABLE questions ALTER COLUMN created_by SET DEFAULT 'MES'
    `)
    console.log("✅ Default created_by value set to MES")

    const result = await pool.query(`
      SELECT
        c.conname AS constraint_name,
        pg_get_constraintdef(c.oid) AS constraint_def
      FROM pg_constraint c
      JOIN pg_class r ON r.oid = c.conrelid
      WHERE c.conname = 'check_created_by'
    `)

    if (result.rows.length > 0) {
      console.log("\n📋 Updated constraint definition:")
      console.log(`   ${result.rows[0].constraint_def}\n`)
      console.log("✅ Constraint successfully updated")
    }
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : error)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

fixConstraint()
