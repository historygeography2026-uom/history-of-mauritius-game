require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const fs = require('fs');
const path = require('path');

async function checkImages() {
  const res = await pool.query(`
    SELECT id, question_text, image_url, subject_id, level_id
    FROM questions
    WHERE image_url IS NOT NULL AND image_url != ''
    ORDER BY id
  `);
  console.log('Total questions in questions table with image_url:', res.rows.length);

  let onDiskCount = 0;
  let missingOnDisk = [];

  for (const r of res.rows) {
    const fn = path.basename(r.image_url);
    const diskPath = path.join(process.cwd(), 'public', 'uploads', fn);
    const exists = fs.existsSync(diskPath);
    if (exists) {
      onDiskCount++;
    } else {
      missingOnDisk.push(r);
    }
  }

  console.log(`On local disk: ${onDiskCount} / ${res.rows.length}`);
  console.log(`Missing on local disk: ${missingOnDisk.length}`);

  console.log('\nSample missing on disk:');
  missingOnDisk.slice(0, 20).forEach(r => {
    console.log(`  [#${r.id}] ${r.image_url} -> Q: ${r.question_text.slice(0, 50)}...`);
  });

  await pool.end();
}

checkImages().catch(console.error);
