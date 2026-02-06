# AWS S3 Setup Guide for Image Storage

## Step 1: Create AWS S3 Bucket

1. Go to [AWS Console](https://console.aws.amazon.com)
2. Navigate to **S3 > Buckets**
3. Click **Create Bucket**
   - **Bucket Name**: `mauritius-game-images` (or any unique name)
   - **Region**: `us-east-1` (or your preferred region)
   - **ACL**: Allow public access (needed for public URLs)
4. Click **Create**

## Step 2: Create AWS IAM User with S3 Access

1. Go to **IAM > Users**
2. Click **Create User**
   - **Username**: `mauritius-game-uploader`
3. Click **Next**
4. Click **Attach Policies Directly**
5. Search for and select: `AmazonS3FullAccess`
6. Click **Create User**

## Step 3: Generate Access Keys

1. Click on the newly created user
2. Go to **Security Credentials > Access Keys**
3. Click **Create Access Key**
   - Choose **Application running outside AWS**
4. Copy and save:
   - **Access Key ID**
   - **Secret Access Key**

## Step 4: Add to .env.local

```env
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=mauritius-game-images
```

## Step 5: Install AWS SDK

```bash
npm install aws-sdk
```

## Step 6: Migrate Existing Supabase Images

```bash
node scripts/migrate-images-to-s3.mjs
```

This will:
- Find all Supabase image URLs in the database
- Download images from Supabase
- Upload them to S3
- Update database URLs to point to S3

## Step 7: Deploy to Render

1. Add environment variables to Render:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `AWS_S3_BUCKET_NAME`

2. Deploy your app
3. Test image upload through the admin panel

## Bucket Policy (Optional - for public read access)

If images are not public, add this bucket policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mauritius-game-images/*"
    }
  ]
}
```

## Cost Estimate

**AWS S3 Free Tier (First 12 months)**
- 5 GB of storage
- 20,000 GET requests
- 2,000 PUT requests
- Perfect for 100-200 images

**After free tier**
- ~$0.023 per GB/month
- ~$0.0004 per 1,000 GET requests
- ~$0.005 per 1,000 PUT requests

## Troubleshooting

**Error: "AccessDenied"**
- Check AWS credentials in .env.local
- Verify IAM user has S3 permissions

**Error: "NoSuchBucket"**
- Verify bucket name matches AWS_S3_BUCKET_NAME
- Check bucket exists in correct region

**Images not loading**
- Verify bucket has public access enabled
- Check S3 URL format is correct

## Next: Switch Upload API

Update your code to use the new S3 upload endpoint at:
`/api/upload-image-s3` instead of `/api/upload-image`
