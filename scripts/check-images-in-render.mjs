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

async function checkImages() {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) as total, COUNT(image_url) as with_images FROM questions WHERE image_url IS NOT NULL AND image_url != \'\''
    );

    const total = result.rows[0].total;
    const withImages = result.rows[0].with_images;

    console.log('📊 IMAGE STATUS IN RENDER:');
    console.log('========================');
    console.log(`Total questions: ${total}`);
    console.log(`Questions with image URLs: ${withImages}`);

    if (withImages > 0) {
      console.log('\n📸 Sample image URLs:');
      const samples = await pool.query(
        'SELECT id, question_text, image_url FROM questions WHERE image_url IS NOT NULL LIMIT 5'
      );
      samples.rows.forEach(r => {
        console.log(`\nQ${r.id}: ${r.question_text.substring(0, 40)}...`);
        console.log(`URL: ${r.image_url}`);
      });
    } else {
      console.log('\n⚠️  No image URLs in database');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkImages();
