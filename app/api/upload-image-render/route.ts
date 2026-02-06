import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_EXTERNAL,
  ssl: { rejectUnauthorized: false },
});

// Render persistent disk mount point
const IMAGES_DIR = process.env.RENDER_DISK_PATH || '/var/data/question-images';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const questionId = formData.get('questionId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID required' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPG, PNG, GIF, WebP' },
        { status: 400 }
      );
    }

    // Limit file size to 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const fileName = `question-${questionId}-${timestamp}.${fileExt}`;
    const filePath = path.join(IMAGES_DIR, fileName);

    // Create directory if it doesn't exist
    await mkdir(IMAGES_DIR, { recursive: true });

    // Convert file to buffer and write to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    // Store file reference in database
    const result = await pool.query(
      `INSERT INTO question_images (question_id, file_path, file_name, file_type, file_size)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (question_id) DO UPDATE SET
         file_path = $2,
         file_name = $3,
         file_type = $4,
         file_size = $5,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id`,
      [questionId, filePath, fileName, file.type, file.size]
    );

    const imageId = result.rows[0].id;

    return NextResponse.json({
      success: true,
      url: `/api/images/${imageId}`,
      imageId,
      message: 'Image uploaded to Render persistent disk',
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('id');

    if (!imageId) {
      return NextResponse.json({ error: 'Image ID required' }, { status: 400 });
    }

    // Get file path from database
    const result = await pool.query(
      'SELECT file_path FROM question_images WHERE id = $1',
      [imageId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const { file_path } = result.rows[0];

    // Delete from database
    await pool.query('DELETE FROM question_images WHERE id = $1', [imageId]);

    // Optionally delete file from disk (comment out if you want to keep it)
    // await unlink(file_path);

    return NextResponse.json({
      success: true,
      message: 'Image deleted',
    });
  } catch (error: any) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
