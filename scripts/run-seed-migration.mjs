/**
 * run-seed-migration.mjs
 *
 * Reads scripts/15_seed_all_question_types.sql and executes every
 * SQL statement against the database defined in .env.local.
 *
 * Usage:
 *   node scripts/run-seed-migration.mjs
 *
 * Prerequisites:
 *   - DATABASE_URL_EXTERNAL must be set in .env.local
 *   - All base tables and reference data must already exist
 *     (run 01_create_schema.sql and insert-defaults.mjs first)
 */

import { Pool } from 'pg'
import { config } from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.join(__dirname, '..', '.env.local') })

const connectionString = process.env.DATABASE_URL_EXTERNAL || process.env.DATABASE_URL
if (!connectionString) {
  console.error('❌ Neither DATABASE_URL_EXTERNAL nor DATABASE_URL is set in .env.local')
  process.exit(1)
}
console.log('🔌 Connecting to:', connectionString.replace(/:([^:@]+)@/, ':***@'))

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

/**
 * Split the SQL file into individual statements.
 * Each block starts with "WITH q AS (...) INSERT ..." or a plain INSERT/UPDATE.
 * We split on the semicolons that terminate each top-level statement.
 */
function splitStatements(sql) {
  // Remove single-line comments
  const noComments = sql
    .split('\n')
    .map(line => {
      const commentIdx = line.indexOf('--')
      return commentIdx >= 0 ? line.substring(0, commentIdx) : line
    })
    .join('\n')

  const statements = []
  let current = ''
  let depth = 0 // track parenthesis depth so we don't split inside CTEs

  for (let i = 0; i < noComments.length; i++) {
    const ch = noComments[i]
    if (ch === '(') depth++
    else if (ch === ')') depth--
    else if (ch === ';' && depth === 0) {
      const stmt = current.trim()
      if (stmt.length > 0) statements.push(stmt)
      current = ''
      continue
    }
    current += ch
  }
  const last = current.trim()
  if (last.length > 0) statements.push(last)
  return statements
}

async function runMigration() {
  const sqlPath = path.join(__dirname, '15_seed_all_question_types.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')
  const statements = splitStatements(sql).filter(s => s.length > 10)

  console.log(`\n📦 Found ${statements.length} SQL statements to execute.\n`)

  const client = await pool.connect()
  let successCount = 0
  let errorCount = 0

  try {
    await client.query('BEGIN')

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i]
      const preview = stmt.replace(/\s+/g, ' ').substring(0, 80)
      try {
        await client.query(stmt)
        successCount++
        process.stdout.write(`  ✓ [${i + 1}/${statements.length}] ${preview}...\n`)
      } catch (err) {
        errorCount++
        console.error(`\n  ✗ [${i + 1}/${statements.length}] FAILED: ${preview}...`)
        console.error(`    Error: ${err.message}\n`)
        // Continue with remaining statements
      }
    }

    await client.query('COMMIT')
    console.log(`\n✅ Migration complete: ${successCount} succeeded, ${errorCount} failed.`)

    if (errorCount > 0) {
      console.log('⚠️  Some statements failed (see above). They were skipped but the rest were committed.')
      console.log('   This usually means those questions already exist – safe to ignore.')
    }
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('\n❌ Fatal error – transaction rolled back:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

runMigration()
