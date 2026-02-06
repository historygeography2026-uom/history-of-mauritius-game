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

async function auditAllTables() {
  try {
    console.log('🔍 COMPLETE DATABASE SCHEMA AUDIT\n');

    // Get all tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log(`📊 Total Tables: ${tablesResult.rows.length}\n`);

    for (const { table_name } of tablesResult.rows) {
      // Get column info
      const columnsResult = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [table_name]);

      // Get row count
      const countResult = await pool.query(`SELECT COUNT(*) FROM "${table_name}"`);
      const recordCount = countResult.rows[0].count;

      const status = recordCount > 0 ? '✅' : '⚠️';
      console.log(`${status} ${table_name.toUpperCase()}`);
      console.log(`   Records: ${recordCount}`);
      console.log(`   Columns: ${columnsResult.rows.length}`);
      columnsResult.rows.forEach(({ column_name, data_type }) => {
        console.log(`     - ${column_name} (${data_type})`);
      });
      console.log();
    }

    console.log('\n📋 SUMMARY:');
    
    // Categorize tables
    const gameData = ['subjects', 'levels', 'question_types', 'questions', 'mcq_options', 'matching_pairs', 'fill_answers', 'reorder_items', 'truefalse_answers'];
    const authData = ['users', 'accounts', 'sessions', 'verification_tokens', 'authenticators'];
    
    let gameComplete = 0;
    let authComplete = 0;

    for (const table of gameData) {
      const result = await pool.query(`SELECT COUNT(*) FROM "${table}"`);
      if (result.rows[0].count > 0) gameComplete++;
    }

    for (const table of authData) {
      const result = await pool.query(`SELECT COUNT(*) FROM "${table}"`);
      if (result.rows[0].count > 0) authComplete++;
    }

    console.log(`\n🎮 Game Data Tables: ${gameComplete}/${gameData.length} populated`);
    console.log(`🔐 Auth Tables: ${authComplete}/${authData.length} populated`);
    
    if (gameComplete === gameData.length) {
      console.log('\n✨ All game data is complete and ready!');
    }
    
    if (authComplete < authData.length) {
      console.log('\n📝 Auth tables (accounts, sessions, etc.) will populate when users log in.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

auditAllTables();
