import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { readFile } from 'fs/promises';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_EXTERNAL,
  ssl: { rejectUnauthorized: false },
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const imageId = params.id;

    if (!imageId) {
      return NextResponse.json({ error: 'Image ID required' }, { status: 400 });
    }

    // Get file path from database
    const result = await pool.query(
      'SELECT file_path, file_type FROM question_images WHERE id = $1',
      [imageId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const { file_path, file_type } = result.rows[0];

    // Read file from Render persistent disk
    const imageData = await readFile(file_path);

    // Return image with appropriate content type
    return new NextResponse(imageData, {
      headers: {
        'Content-Type': file_type,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  } catch (error: any) {
    console.error('Error retrieving image:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
