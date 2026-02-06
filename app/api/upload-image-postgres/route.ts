import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_EXTERNAL,
  ssl: { rejectUnauthorized: false },
});

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

    // Limit file size to 2MB (PostgreSQL friendly)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 2MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Insert image into PostgreSQL
    const result = await pool.query(
      `INSERT INTO question_images (question_id, image_data, file_name, file_type, file_size)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (question_id) DO UPDATE SET
         image_data = $2,
         file_name = $3,
         file_type = $4,
         file_size = $5,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id`,
      [questionId, buffer, file.name, file.type, file.size]
    );

    const imageId = result.rows[0].id;

    // Return URL to retrieve image
    const imageUrl = `/api/images/${imageId}`;

    return NextResponse.json({
      success: true,
      url: imageUrl,
      imageId,
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

    await pool.query('DELETE FROM question_images WHERE id = $1', [imageId]);

    return NextResponse.json({
      success: true,
      message: 'Image deleted',
    });
  } catch (error: any) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
