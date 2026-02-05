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

async function insertDefaults() {
  try {
    console.log('Inserting default data...\n');
    
    // Insert subjects
    const subjectsResult = await pool.query(
      "INSERT INTO subjects (name) VALUES ('history'), ('geography'), ('combined') ON CONFLICT (name) DO NOTHING RETURNING *"
    );
    console.log(`✓ Subjects inserted: ${subjectsResult.rows.length}`);
    
    // Insert levels
    const levelsResult = await pool.query(
      "INSERT INTO levels (level_number) VALUES (1), (2), (3) ON CONFLICT (level_number) DO NOTHING RETURNING *"
    );
    console.log(`✓ Levels inserted: ${levelsResult.rows.length}`);
    
    // Insert question types
    const typesResult = await pool.query(`
      INSERT INTO question_types (name) VALUES 
      ('mcq'), ('matching'), ('fill'), ('reorder'), ('truefalse')
      ON CONFLICT (name) DO NOTHING RETURNING *
    `);
    console.log(`✓ Question types inserted: ${typesResult.rows.length}`);
    
    console.log('\n✨ Default data inserted successfully!');
    
  } catch (error) {
    console.error('Error inserting defaults:', error.message);
  } finally {
    await pool.end();
  }
}

insertDefaults();
