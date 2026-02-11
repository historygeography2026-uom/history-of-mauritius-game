// Update image_url from /api/images/ to /uploads/ for static file serving
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const result = await pool.query(
    `UPDATE questions SET image_url = REPLACE(image_url, '/api/images/', '/uploads/') WHERE image_url LIKE '/api/images/%' RETURNING id, image_url`
  );
  console.log(`Updated ${result.rowCount} questions to static paths:`);
  result.rows.forEach(row => console.log(`  ID ${row.id}: ${row.image_url}`));
  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
