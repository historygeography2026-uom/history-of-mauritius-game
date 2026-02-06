import AWS from 'aws-sdk';
import { NextResponse } from 'next/server';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'mauritius-game-images';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const questionId = formData.get('questionId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPG, PNG, GIF, WebP' },
        { status: 400 }
      );
    }

    // Limit file size to 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }

    // Check AWS credentials
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return NextResponse.json(
        { error: 'Image upload not configured. AWS credentials missing.' },
        { status: 500 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const fileName = questionId
      ? `question-${questionId}-${timestamp}.${fileExt}`
      : `temp-${timestamp}-${randomId}.${fileExt}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    const s3Params = {
      Bucket: BUCKET_NAME,
      Key: `questions/${fileName}`,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read' as const,
    };

    const s3Response = await s3.putObject(s3Params).promise();

    // Generate S3 public URL
    const publicUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/questions/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: `questions/${fileName}`,
    });
  } catch (error: any) {
    console.error('Error uploading image to S3:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete an image from S3
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    const url = searchParams.get('url');

    // Extract path from URL if path not provided directly
    let filePath = path;
    if (!filePath && url) {
      // Extract filename from S3 URL
      // URL format: https://bucket-name.s3.amazonaws.com/questions/filename.jpg
      const match = url.match(/\/questions\/(.+)$/);
      if (match) {
        filePath = `questions/${match[1]}`;
      }
    }

    if (!filePath) {
      return NextResponse.json({ error: 'No file path provided' }, { status: 400 });
    }

    const s3Params = {
      Bucket: BUCKET_NAME,
      Key: filePath,
    };

    await s3.deleteObject(s3Params).promise();

    return NextResponse.json({
      success: true,
      message: 'Image deleted from S3',
    });
  } catch (error: any) {
    console.error('Error deleting image from S3:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
