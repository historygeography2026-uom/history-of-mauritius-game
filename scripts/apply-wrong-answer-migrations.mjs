/**
 * apply-wrong-answer-migrations.mjs
 *
 * Checks / applies the additive migrations for silent wrong-answer tracking:
 *   - 16_add_guest_token.sql      (practice_attempts.guest_token)
 *   - 17_create_game_attempts.sql (game_attempts table)
 *
 * Usage:
 *   node scripts/apply-wrong-answer-migrations.mjs          # check only
 *   node scripts/apply-wrong-answer-migrations.mjs --apply  # apply (idempotent)
 */

import pg from 'pg'
import { config } from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.join(__dirname, '..', '.env.local') })

const connectionString = process.env.DATABASE_URL_EXTERNAL || process.env.DATABASE_URL
if (!connectionString) {
  console.error('Neither DATABASE_URL_EXTERNAL nor DATABASE_URL is set in .env.local')
  process.exit(1)
}

const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } })
const apply = process.argv.includes('--apply')

async function status() {
  const col = await pool.query(
    `SELECT data_type FROM information_schema.columns
     WHERE table_name = 'practice_attempts' AND column_name = 'guest_token'`
  )
  const tbl = await pool.query(`SELECT to_regclass('public.game_attempts') AS t`)
  const types = await pool.query(
    `SELECT table_name, data_type FROM information_schema.columns
     WHERE column_name = 'id' AND table_name IN ('questions','users') AND table_schema = 'public'`
  )
  console.log('practice_attempts.guest_token:', col.rows[0]?.data_type ?? 'MISSING')
  console.log('game_attempts table:', tbl.rows[0].t ?? 'MISSING')
  console.log('id types:', types.rows.map((r) => `${r.table_name}=${r.data_type}`).join(', '))
}

try {
  await status()
  if (apply) {
    for (const file of ['16_add_guest_token.sql', '17_create_game_attempts.sql']) {
      const sql = fs.readFileSync(path.join(__dirname, file), 'utf8')
      await pool.query(sql)
      console.log('Applied', file)
    }
    await status()
  }
} catch (e) {
  console.error('Error:', e.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
