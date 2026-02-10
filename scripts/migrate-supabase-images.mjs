// Script to list and download images from Supabase Storage to Render persistent disk
// Usage: node scripts/migrate-supabase-images.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Supabase config from .env.local
const SUPABASE_URL = 'https://zjziegyiscwdpnimjtgm.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqemllZ3lpc2N3ZHBuaW1qdGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzYxMjczMCwiZXhwIjoyMDc5MTg4NzMwfQ.ceVs0Ee_JuIvFghLUDSinPPquWSdAwrzZJN6II_9KbY';

// Local output directory (dev fallback for Render persistent disk)
const OUTPUT_DIR = process.env.RENDER_DISK_PATH
  ? path.join(process.env.RENDER_DISK_PATH, 'question-images')
  : path.join(ROOT, 'public', 'uploads');

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

async function listBuckets() {
  console.log('1. Listing storage buckets...');
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, { headers });
  if (!res.ok) {
    console.log(`   Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log(`   Response: ${text}`);
    return [];
  }
  const buckets = await res.json();
  console.log(`   Found ${buckets.length} buckets:`);
  buckets.forEach(b => console.log(`     - ${b.name} (public: ${b.public})`));
  return buckets;
}

async function listFiles(bucketName) {
  console.log(`\n2. Listing files in "${bucketName}" bucket...`);
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${bucketName}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      prefix: '',
      limit: 500,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    }),
  });
  if (!res.ok) {
    console.log(`   Status: ${res.status} ${res.statusText}`);
    return [];
  }
  const files = await res.json();
  const imageFiles = files.filter(f => f.name && !f.name.endsWith('/'));
  console.log(`   Found ${imageFiles.length} files:`);
  imageFiles.forEach(f => {
    const size = f.metadata?.size ? `${(f.metadata.size / 1024).toFixed(1)}KB` : 'unknown';
    console.log(`     - ${f.name} (${size}, ${f.metadata?.mimetype || 'unknown'})`);
  });
  return imageFiles;
}

async function downloadFile(bucketName, fileName) {
  // Try public URL first
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucketName}/${fileName}`;
  let res = await fetch(publicUrl);
  
  if (!res.ok) {
    // Try authenticated download
    const authUrl = `${SUPABASE_URL}/storage/v1/object/${bucketName}/${fileName}`;
    res = await fetch(authUrl, { headers });
  }
  
  if (!res.ok) {
    console.log(`   ❌ Failed to download ${fileName}: ${res.status}`);
    return null;
  }

  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  console.log('=== Supabase Storage → Render Persistent Disk Migration ===\n');
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  // Step 1: List buckets
  const buckets = await listBuckets();
  
  if (buckets.length === 0) {
    console.log('\n⚠️  No buckets found or cannot access Supabase Storage.');
    console.log('   The Supabase project may have been deleted or credentials expired.');
    return;
  }

  // Step 2: List files in question-images bucket
  const targetBucket = buckets.find(b => b.name === 'question-images') || buckets[0];
  const files = await listFiles(targetBucket.name);

  if (files.length === 0) {
    console.log('\n⚠️  No image files found in the bucket.');
    
    // Also check other buckets
    for (const b of buckets) {
      if (b.name !== targetBucket.name) {
        await listFiles(b.name);
      }
    }
    return;
  }

  // Step 3: Download all files
  console.log(`\n3. Downloading ${files.length} files to ${OUTPUT_DIR}...`);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let downloaded = 0;
  let failed = 0;

  for (const f of files) {
    process.stdout.write(`   Downloading ${f.name}... `);
    const buffer = await downloadFile(targetBucket.name, f.name);
    
    if (buffer) {
      const outPath = path.join(OUTPUT_DIR, f.name);
      fs.writeFileSync(outPath, buffer);
      console.log(`✅ (${(buffer.length / 1024).toFixed(1)}KB)`);
      downloaded++;
    } else {
      failed++;
    }
  }

  console.log(`\n=== Migration Complete ===`);
  console.log(`   ✅ Downloaded: ${downloaded}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📁 Output: ${OUTPUT_DIR}`);
  
  if (downloaded > 0) {
    console.log(`\n   Images are now accessible at /api/images/<filename>`);
    console.log(`   You can update questions' image_url in the admin panel.`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
