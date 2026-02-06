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

async function createImageTable() {
  try {
    console.log('🗄️  Creating question_images table in PostgreSQL...\n');

    // Create table to store images as binary data
    await pool.query(`
      CREATE TABLE IF NOT EXISTS question_images (
        id SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
        image_data BYTEA NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        file_size INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(question_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_question_images_question_id ON question_images(question_id);
    `);

    console.log('✅ question_images table created successfully');

    // Check record count
    const result = await pool.query('SELECT COUNT(*) FROM question_images');
    console.log(`\n📊 Current images in database: ${result.rows[0].count}`);

    console.log('\n✨ PostgreSQL image storage is ready!');
    console.log('\n💡 Images will be:');
    console.log('   ✅ Stored in Render PostgreSQL');
    console.log('   ✅ Persistent (not lost on redeploy)');
    console.log('   ✅ No external dependencies');
    console.log('   ⚠️  Heavier database (consider for ~1000 small images)');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createImageTable();
