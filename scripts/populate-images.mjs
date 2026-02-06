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

const imageMapping = {
  'capital': 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&h=300&fit=crop',
  'Dodo': 'https://images.unsplash.com/photo-1454600327868-d76eacc4f8ee?w=400&h=300&fit=crop',
  'independence': 'https://images.unsplash.com/photo-1461749387671-04a00736adc9?w=400&h=300&fit=crop',
  'Le Morne': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  'Seven Colored Earth': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  'ocean': 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop',
  'dance': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
  'mountain': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  'island': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop',
  'history': 'https://images.unsplash.com/photo-1507842217343-583f20270419?w=400&h=300&fit=crop',
  'geography': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop',
  'Aapravasi': 'https://images.unsplash.com/photo-1519356721914-e67fc57a8c59?w=400&h=300&fit=crop',
  'Dutch': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop',
  'French': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop',
  'UNESCO': 'https://images.unsplash.com/photo-1454600327868-d76eacc4f8ee?w=400&h=300&fit=crop',
  'Sega': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
  'culture': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
  'temple': 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=300&fit=crop',
  'landscape': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
};

async function populateImages() {
  try {
    console.log('🖼️  Populating images for relevant questions...\n');

    // Get all questions
    const questions = await pool.query('SELECT id, question_text FROM questions ORDER BY id');
    
    let updated = 0;
    for (const q of questions.rows) {
      const text = q.question_text.toLowerCase();
      let imageUrl = null;

      // Match keywords to find appropriate image
      for (const [keyword, url] of Object.entries(imageMapping)) {
        if (text.includes(keyword.toLowerCase())) {
          imageUrl = url;
          break;
        }
      }

      if (imageUrl) {
        await pool.query(
          'UPDATE questions SET image_url = $1 WHERE id = $2',
          [imageUrl, q.id]
        );
        updated++;
      }
    }

    console.log(`✅ Updated ${updated} questions with images`);
    console.log(`⚠️  ${questions.rows.length - updated} questions remain without images`);
    
    // Show sample
    const samples = await pool.query(
      'SELECT id, question_text, image_url FROM questions WHERE image_url IS NOT NULL LIMIT 5'
    );
    
    if (samples.rows.length > 0) {
      console.log('\n📸 Sample images added:');
      samples.rows.forEach((row, idx) => {
        console.log(`\n${idx + 1}. Q${row.id}: ${row.question_text.substring(0, 45)}...`);
        console.log(`   ✅ Image: ${row.image_url.substring(0, 50)}...`);
      });
    }

    console.log('\n✨ Image population complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

populateImages();
