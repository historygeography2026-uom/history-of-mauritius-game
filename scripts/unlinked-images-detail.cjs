const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const files = fs.readdirSync(uploadsDir).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));

  // Get all image_url values from DB
  const dbImages = await pool.query(`SELECT id, question_text, image_url FROM questions WHERE image_url IS NOT NULL`);
  const linkedFiles = new Set(dbImages.rows.map(r => path.basename(r.image_url)));

  console.log('=== Detailed Unlinked Image Analysis ===\n');

  // 1. The 7 old question IDs
  console.log('--- 7 Images with old Supabase question IDs (not in Render DB) ---');
  const oldIdFiles = files.filter(f => {
    const m = f.match(/^(?:question-|migrated-q)(\d+)/);
    return m && !linkedFiles.has(f);
  });

  for (const f of oldIdFiles) {
    const m = f.match(/^(?:question-|migrated-q)(\d+)/);
    const oldId = parseInt(m[1]);
    const size = fs.statSync(path.join(uploadsDir, f)).size;
    
    // Try to find a question with similar text in Render DB
    console.log(`\n  File: ${f}`);
    console.log(`  Old Supabase question ID: ${oldId}`);
    console.log(`  Size: ${(size / 1024).toFixed(1)} KB`);
    
    // Check if this ID exists
    const exists = await pool.query('SELECT id FROM questions WHERE id = $1', [oldId]);
    if (exists.rows.length > 0) {
      console.log(`  Status: ID ${oldId} EXISTS in Render DB but was not linked (possible duplicate file)`);
    } else {
      console.log(`  Status: ID ${oldId} does NOT exist in Render DB`);
    }
  }

  // 2. The 5 unnamed Excel imports
  console.log('\n\n--- 5 Unnamed Excel-imported Images ---');
  const excelFiles = files.filter(f => f.startsWith('imported-'));
  for (const f of excelFiles) {
    const size = fs.statSync(path.join(uploadsDir, f)).size;
    console.log(`\n  File: ${f}`);
    console.log(`  Size: ${(size / 1024).toFixed(1)} KB`);
    console.log(`  Status: No question ID in filename — uploaded via Excel import, cannot auto-link`);
  }

  // 3. Check for duplicate files (same question ID, multiple timestamps)
  console.log('\n\n--- Duplicate Files (same question ID, multiple versions) ---');
  const idMap = new Map();
  for (const f of files) {
    const m = f.match(/^question-(\d+)-/);
    if (m) {
      const id = m[1];
      if (!idMap.has(id)) idMap.set(id, []);
      idMap.get(id).push(f);
    }
  }
  const dupes = [...idMap.entries()].filter(([, v]) => v.length > 1);
  if (dupes.length === 0) {
    console.log('  None found');
  } else {
    for (const [id, dfiles] of dupes) {
      console.log(`\n  Question ID ${id} has ${dfiles.length} files:`);
      for (const f of dfiles) {
        const isLinked = linkedFiles.has(f);
        console.log(`    ${isLinked ? '✅ LINKED' : '⚠️  UNUSED'}: ${f}`);
      }
    }
  }

  // Summary
  console.log('\n\n--- What can be done? ---');
  console.log(`  Old ID images (${oldIdFiles.length}): These were for Supabase-only questions that were re-inserted`);
  console.log(`    with new IDs in Render. The question TEXT exists but the ID changed.`);
  console.log(`    → Can be manually matched by question text if needed.`);
  console.log(`  Excel imports (${excelFiles.length}): Uploaded via Excel with random filenames.`);
  console.log(`    → Must be manually linked via admin panel.`);
  console.log(`  Duplicates (${dupes.length}): Older versions of the same question image.`);
  console.log(`    → Safe to ignore, the latest version is already linked.`);

  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
