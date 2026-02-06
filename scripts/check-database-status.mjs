import { Pool } from 'pg';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_EXTERNAL,
  ssl: { rejectUnauthorized: false },
});

async function compareData() {
  try {
    console.log('📊 RENDER PostgreSQL DATABASE STATUS\n');
    console.log('='.repeat(50));

    // Count all tables
    const tables = [
      'subjects',
      'levels',
      'question_types',
      'questions',
      'mcq_options',
      'matching_pairs',
      'fill_answers',
      'reorder_items',
      'truefalse_answers',
      'users',
      'accounts',
      'sessions',
      'verification_tokens',
      'authenticators'
    ];

    console.log('\n📦 DATA SUMMARY:\n');
    for (const table of tables) {
      const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
      const count = result.rows[0].count;
      const status = count > 0 ? '✅' : '⚠️';
      console.log(`${status} ${table.padEnd(25)} ${count} records`);
    }

    // Get sample questions to show structure
    console.log('\n' + '='.repeat(50));
    console.log('\n📋 SAMPLE QUESTIONS WITH ANSWERS:\n');

    const sample = await pool.query(`
      SELECT 
        q.id,
        q.question_text,
        qt.name as type,
        (SELECT COUNT(*) FROM mcq_options WHERE question_id = q.id) as mcq_count,
        (SELECT COUNT(*) FROM fill_answers WHERE question_id = q.id) as fill_count,
        (SELECT COUNT(*) FROM matching_pairs WHERE question_id = q.id) as pair_count,
        (SELECT COUNT(*) FROM truefalse_answers WHERE question_id = q.id) as tf_count
      FROM questions q
      JOIN question_types qt ON q.question_type_id = qt.id
      LIMIT 5
    `);

    for (const row of sample.rows) {
      console.log(`Q${row.id}: ${row.question_text}`);
      console.log(`  Type: ${row.type}`);
      if (row.mcq_count > 0) console.log(`  ✅ MCQ Options: ${row.mcq_count}`);
      if (row.fill_count > 0) console.log(`  ✅ Fill Answers: ${row.fill_count}`);
      if (row.pair_count > 0) console.log(`  ✅ Matching Pairs: ${row.pair_count}`);
      if (row.tf_count > 0) console.log(`  ✅ True/False: ${row.tf_count}`);
      console.log();
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

compareData();
