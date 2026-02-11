const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const path = require('path');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log('=== FULL MIGRATION AUDIT: Supabase → Render ===\n');

  // 1. List all tables
  const tables = await pool.query(
    `SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`
  );
  console.log('--- All Tables in Render DB ---');
  tables.rows.forEach(r => console.log(`  ${r.tablename}`));

  // 2. Row counts for all tables
  console.log('\n--- Row Counts ---');
  for (const t of tables.rows) {
    const r = await pool.query(`SELECT COUNT(*) as c FROM "${t.tablename}"`);
    console.log(`  ${t.tablename}: ${r.rows[0].c}`);
  }

  // 3. Questions columns
  const cols = await pool.query(
    `SELECT column_name, data_type FROM information_schema.columns 
     WHERE table_name='questions' ORDER BY ordinal_position`
  );
  console.log('\n--- Questions Table Columns ---');
  cols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`));

  // 4. Image audit
  const imgStats = await pool.query(`
    SELECT 
      COUNT(*) as total,
      COUNT(image_url) as with_image,
      COUNT(CASE WHEN image_url LIKE '%supabase%' THEN 1 END) as supabase_urls,
      COUNT(CASE WHEN image_url LIKE '/api/images/%' THEN 1 END) as api_urls,
      COUNT(CASE WHEN image_url LIKE '/uploads/%' THEN 1 END) as upload_urls
    FROM questions
  `);
  console.log('\n--- Image URL Audit ---');
  const s = imgStats.rows[0];
  console.log(`  Total questions: ${s.total}`);
  console.log(`  With image_url: ${s.with_image}`);
  console.log(`  Supabase URLs: ${s.supabase_urls}`);
  console.log(`  /api/images/ URLs: ${s.api_urls}`);
  console.log(`  /uploads/ URLs: ${s.upload_urls}`);

  // 5. Local images
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const files = fs.existsSync(uploadsDir)
    ? fs.readdirSync(uploadsDir).filter(f => /\.(jpg|jpeg|png|gif|webp|png)$/i.test(f))
    : [];
  console.log(`\n--- Local Images (public/uploads/) ---`);
  console.log(`  Files: ${files.length}`);

  // 6. Supabase bucket had 67 images, check coverage
  console.log('\n--- Migration Summary ---');
  console.log(`  Supabase bucket had: 67 images`);
  console.log(`  Downloaded locally: ${files.length}`);
  console.log(`  Linked to DB questions: ${s.with_image}`);
  console.log(`  Old Supabase URLs remaining: ${s.supabase_urls}`);

  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
