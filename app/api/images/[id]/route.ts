import { NextResponse } from 'next/server';
import { Pool } from 'pg';

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

    // Retrieve image from PostgreSQL
    const result = await pool.query(
      'SELECT image_data, file_type FROM question_images WHERE id = $1',
      [imageId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const { image_data, file_type } = result.rows[0];

    // Return image with appropriate content type
    return new NextResponse(image_data, {
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
