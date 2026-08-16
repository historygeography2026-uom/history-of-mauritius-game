/**
 * Deduplication script: removes duplicate rows in mcq_options
 * keeping only the lowest option_order row per (question_id, option_text).
 */
import pg from 'pg'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com')
    ? { rejectUnauthorized: false }
    : false,
})

async function main() {
  const client = await pool.connect()
  try {
    // 1. Report: how many questions have duplicate options?
    const { rows: dupeReport } = await client.query(`
      SELECT question_id, COUNT(*) as total_options, COUNT(DISTINCT option_text) as unique_options
      FROM mcq_options
      GROUP BY question_id
      HAVING COUNT(*) > COUNT(DISTINCT option_text)
      ORDER BY question_id
    `)

    if (dupeReport.length === 0) {
      console.log('✅ No duplicate MCQ options found.')
      return
    }

    console.log(`⚠️  Found ${dupeReport.length} question(s) with duplicate options:`)
    for (const row of dupeReport) {
      console.log(`  question_id=${row.question_id}: ${row.total_options} total, ${row.unique_options} unique`)
    }

    // 2. Delete duplicates: keep only the row with the smallest ctid per (question_id, option_text)
    const { rowCount } = await client.query(`
      DELETE FROM mcq_options
      WHERE ctid NOT IN (
        SELECT MIN(ctid)
        FROM mcq_options
        GROUP BY question_id, option_text
      )
    `)
    console.log(`🗑️  Deleted ${rowCount} duplicate row(s).`)

    // 3. Re-number option_order sequentially (1,2,3,4) per question after dedup
    const { rows: questions } = await client.query(
      `SELECT DISTINCT question_id FROM mcq_options ORDER BY question_id`
    )
    for (const { question_id } of questions) {
      const { rows: opts } = await client.query(
        `SELECT id FROM mcq_options WHERE question_id = $1 ORDER BY option_order, id`,
        [question_id]
      )
      for (let i = 0; i < opts.length; i++) {
        await client.query(
          `UPDATE mcq_options SET option_order = $1 WHERE id = $2`,
          [i + 1, opts[i].id]
        )
      }
    }
    console.log('✅ option_order renumbered cleanly.')

    // 4. Verify
    const { rows: verify } = await client.query(`
      SELECT question_id, COUNT(*) as cnt
      FROM mcq_options
      GROUP BY question_id
      ORDER BY cnt DESC
      LIMIT 5
    `)
    console.log('Top option counts after fix:', verify)
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(err => { console.error(err); process.exit(1) })
