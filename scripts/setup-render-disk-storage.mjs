import { Pool } from 'pg';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_EXTERNAL,
  ssl: { rejectUnauthorized: false },
});

// Render persistent disk mount point
const IMAGES_DIR = process.env.RENDER_DISK_PATH || '/var/data/question-images';

async function setupRenderDiskStorage() {
  try {
    console.log('💾 SETTING UP RENDER PERSISTENT DISK STORAGE\n');

    // Create images directory if it doesn't exist
    try {
      await fs.mkdir(IMAGES_DIR, { recursive: true });
      console.log(`✅ Images directory created: ${IMAGES_DIR}`);
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      console.log(`✅ Images directory exists: ${IMAGES_DIR}`);
    }

    // Update database schema to store file paths instead of BYTEA
    console.log('\n📝 Updating database schema...');
    
    // Drop old BYTEA table if it exists
    await pool.query('DROP TABLE IF EXISTS question_images CASCADE');
    console.log('✅ Dropped old question_images table');

    // Create new table for file references
    await pool.query(`
      CREATE TABLE IF NOT EXISTS question_images (
        id SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
        file_path VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        file_size INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(question_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_question_images_question_id ON question_images(question_id);
    `);

    console.log('✅ Created new question_images table for file references');

    console.log('\n✨ Render Persistent Disk Storage Setup Complete!');
    console.log('\n📊 Configuration:');
    console.log(`   Images directory: ${IMAGES_DIR}`);
    console.log(`   Database: Storing file paths only (lightweight)`);
    console.log(`   Files persist: ✅ Yes (survive redeployments)`);
    console.log(`   Cost: $7/month for persistent disk`);
    
    console.log('\n💡 How it works:');
    console.log('   1. User uploads image → /api/upload-image-render');
    console.log(`   2. File saved to: ${IMAGES_DIR}/[filename]`);
    console.log('   3. File path stored in database');
    console.log('   4. Image served from: /api/images/[id]');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

setupRenderDiskStorage();
