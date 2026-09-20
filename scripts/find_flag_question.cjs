require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function findQ() {
  const res = await pool.query(`
    SELECT q.id, q.question_text, q.image_url, s.name as subject_name, l.level_number
    FROM questions q
    LEFT JOIN subjects s ON q.subject_id = s.id
    LEFT JOIN levels l ON q.level_id = l.id
    WHERE q.question_text ILIKE '%flag%' OR q.question_text ILIKE '%symbolise%'
  `);
  console.log('Game mode questions matching:', res.rows.length);
  res.rows.forEach(r => {
    console.log(`[#${r.id}] (${r.subject_name} L${r.level_number}) img: "${r.image_url}"`);
    console.log(`   Q: ${r.question_text}`);
  });

  await pool.end();
}

findQ().catch(console.error);
