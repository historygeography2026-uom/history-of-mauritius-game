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

async function verifySchema() {
  try {
    console.log('Verifying Render PostgreSQL schema...\n');
    
    // Get all tables
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('✓ Tables in database:');
    result.rows.forEach((row, i) => {
      console.log(`  ${i + 1}. ${row.table_name}`);
    });
    
    console.log('\n✓ Expected tables:');
    const expected = [
      'subjects',
      'levels',
      'question_types',
      'questions',
      'mcq_options',
      'matching_pairs',
      'fill_answers',
      'reorder_items',
      'truefalse_answers'
    ];
    expected.forEach((table, i) => {
      const exists = result.rows.some(r => r.table_name === table);
      console.log(`  ${exists ? '✓' : '✗'} ${table}`);
    });
    
    // Count records in each table
    console.log('\n✓ Record counts:');
    for (const table of expected) {
      const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`  ${table}: ${countResult.rows[0].count} records`);
    }
    
    console.log('\n✨ Render PostgreSQL database is ready for deployment!');
    
  } catch (error) {
    console.error('Error verifying schema:', error.message);
  } finally {
    await pool.end();
  }
}

verifySchema();
