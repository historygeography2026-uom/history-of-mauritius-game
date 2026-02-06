import { Pool } from 'pg';
import AWS from 'aws-sdk';
import axios from 'axios';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env.local') });

// AWS S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'mauritius-game-images';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL_EXTERNAL,
  ssl: { rejectUnauthorized: false },
});

async function migrateImagesToS3() {
  try {
    console.log('🔄 MIGRATING IMAGES FROM SUPABASE TO AWS S3\n');

    // Check if AWS credentials are set
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.log('⚠️  AWS credentials not found in .env.local');
      console.log('You need to set:');
      console.log('  AWS_ACCESS_KEY_ID');
      console.log('  AWS_SECRET_ACCESS_KEY');
      console.log('  AWS_REGION (optional, defaults to us-east-1)');
      console.log('  AWS_S3_BUCKET_NAME (optional, defaults to mauritius-game-images)');
      await pool.end();
      return;
    }

    // Get all questions with Supabase image URLs
    const result = await pool.query(
      "SELECT id, question_text, image_url FROM questions WHERE image_url IS NOT NULL AND image_url LIKE '%supabase%'"
    );

    if (result.rows.length === 0) {
      console.log('✅ No Supabase images found to migrate');
      await pool.end();
      return;
    }

    console.log(`📸 Found ${result.rows.length} images to migrate from Supabase\n`);

    let successCount = 0;
    let failCount = 0;

    for (const row of result.rows) {
      try {
        const supabaseUrl = row.image_url;
        console.log(`\n⬇️  Downloading: Q${row.id}`);

        // Download image from Supabase
        const response = await axios.get(supabaseUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data);

        // Extract filename from Supabase URL
        const urlParts = supabaseUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        // Upload to S3
        console.log(`⬆️  Uploading to S3...`);
        const s3Params = {
          Bucket: BUCKET_NAME,
          Key: `questions/${fileName}`,
          Body: imageBuffer,
          ContentType: response.headers['content-type'],
          ACL: 'public-read',
        };

        await s3.putObject(s3Params).promise();

        // Generate S3 URL
        const s3Url = `https://${BUCKET_NAME}.s3.amazonaws.com/questions/${fileName}`;

        // Update database
        await pool.query('UPDATE questions SET image_url = $1 WHERE id = $2', [s3Url, row.id]);

        console.log(`✅ Migrated to: ${s3Url}`);
        successCount++;

      } catch (error) {
        console.error(`❌ Failed to migrate Q${row.id}:`, error.message);
        failCount++;
      }
    }

    console.log(`\n📊 MIGRATION COMPLETE`);
    console.log(`✅ Successfully migrated: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`\n💡 Next step: Update your .env.local with S3 credentials`);

  } catch (error) {
    console.error('❌ Migration error:', error.message);
  } finally {
    await pool.end();
  }
}

migrateImagesToS3();
