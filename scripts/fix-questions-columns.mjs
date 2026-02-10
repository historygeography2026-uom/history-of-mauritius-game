import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: 'dpg-d63imsvpm1nc73bmh530-a.singapore-postgres.render.com',
  port: 5432,
  database: 'mauriitus_game',
  user: 'mauriitus_game_user',
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

const cols = await pool.query(
  `SELECT column_name, data_type FROM information_schema.columns WHERE table_name='questions' ORDER BY ordinal_position`
);
console.log('questions columns:');
cols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`));

// Add missing columns
const missing = [];

const hasImageUrl = cols.rows.some(r => r.column_name === 'image_url');
if (!hasImageUrl) {
  await pool.query('ALTER TABLE questions ADD COLUMN image_url TEXT');
  missing.push('image_url');
}

const hasCreatedBy = cols.rows.some(r => r.column_name === 'created_by');
if (!hasCreatedBy) {
  await pool.query('ALTER TABLE questions ADD COLUMN created_by TEXT');
  missing.push('created_by');
}

const hasDisplayTitle = cols.rows.some(r => r.column_name === 'display_title');
if (!hasDisplayTitle) {
  await pool.query('ALTER TABLE questions ADD COLUMN display_title TEXT');
  missing.push('display_title');
}

if (missing.length > 0) {
  console.log('\n✅ Added missing columns:', missing.join(', '));
} else {
  console.log('\n✅ All columns already exist');
}

await pool.end();
