const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log('=== Render PostgreSQL - Full Data Audit ===\n');

  // 1. Table row counts
  const tables = [
    'questions', 'subjects', 'levels', 'question_types',
    'multiple_choice_questions', 'true_false_questions',
    'fill_in_blank_questions', 'matching_questions', 'reorder_questions',
    'user_profiles'
  ];

  console.log('--- Table Row Counts ---');
  for (const t of tables) {
    try {
      const r = await pool.query(`SELECT COUNT(*) as c FROM ${t}`);
      console.log(`  ${t}: ${r.rows[0].c} rows`);
    } catch (e) {
      console.log(`  ${t}: ERROR - ${e.message}`);
    }
  }

  // 2. Image coverage
  console.log('\n--- Image Coverage ---');
  const img = await pool.query(
    `SELECT COUNT(*) as total, COUNT(image_url) as with_image FROM questions`
  );
  console.log(`  Questions with image_url: ${img.rows[0].with_image} / ${img.rows[0].total}`);

  // 3. Sample image URLs
  const samples = await pool.query(
    `SELECT id, image_url FROM questions WHERE image_url IS NOT NULL ORDER BY id LIMIT 5`
  );
  console.log('  Sample URLs:');
  samples.rows.forEach(r => console.log(`    ID ${r.id}: ${r.image_url}`));

  // 4. Check for any remaining Supabase URLs
  const supaUrls = await pool.query(
    `SELECT COUNT(*) as c FROM questions WHERE image_url LIKE '%supabase%'`
  );
  console.log(`\n  ⚠️  Supabase URLs still in DB: ${supaUrls.rows[0].c}`);

  // 5. Questions by type breakdown
  console.log('\n--- Questions by Type ---');
  const byType = await pool.query(
    `SELECT qt.name, COUNT(q.id) as count 
     FROM questions q JOIN question_types qt ON q.question_type_id = qt.id 
     GROUP BY qt.name ORDER BY count DESC`
  );
  byType.rows.forEach(r => console.log(`  ${r.name}: ${r.count}`));

  // 6. Local images count
  const fs = require('fs');
  const path = require('path');
  const uploadsDir = path.join(__dirname, 'public', 'uploads');
  const files = fs.existsSync(uploadsDir) 
    ? fs.readdirSync(uploadsDir).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
    : [];
  console.log(`\n--- Local Images (public/uploads/) ---`);
  console.log(`  Files on disk: ${files.length}`);

  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
