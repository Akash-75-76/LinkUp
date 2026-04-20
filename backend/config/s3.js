import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import dotenv from 'dotenv';

dotenv.config();

// Debug: Log environment variables
console.log('🔍 S3 Config Debug:');
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✓ Loaded' : '❌ MISSING');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✓ Loaded' : '❌ MISSING');
console.log('AWS_SESSION_TOKEN:', process.env.AWS_SESSION_TOKEN ? '✓ Loaded' : '—');
console.log('AWS_REGION:', process.env.AWS_REGION || 'us-east-1');
console.log('AWS_S3_BUCKET:', process.env.AWS_S3_BUCKET || 'linkup-media-bucket-2026');

// Validate credentials exist
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error('❌ ERROR: AWS credentials are missing in .env file!');
  console.error('Please add AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to your .env file');
}

const region = process.env.AWS_REGION || 'us-east-1';
const hasStaticCreds = Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

// If static creds are not provided, let the AWS SDK resolve credentials automatically
// (e.g. EC2 instance profile / IAM role, ECS task role, shared credentials file, etc.)
const s3Client = new S3Client({
  region,
  ...(hasStaticCreds
    ? {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          ...(process.env.AWS_SESSION_TOKEN
            ? { sessionToken: process.env.AWS_SESSION_TOKEN }
            : {}),
        },
      }
    : {}),
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'linkup-media-bucket-2026';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

/**
 * Upload file to S3
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {String} fileName - Original filename
 * @param {String} folder - Folder path (e.g., 'profile-photos', 'post-images')
 * @returns {Promise<String>} S3 file URL
 */
export const uploadToS3 = async (fileBuffer, fileName, folder = 'uploads') => {
  try {
    const timestamp = Date.now();
    const cleanFileName = fileName.replace(/\s+/g, '-').toLowerCase();
    const key = `${folder}/${timestamp}-${cleanFileName}`;

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: 'image/jpeg', // Adjust based on file type if needed
      ACL: 'public-read', // Makes file publicly readable
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    const fileUrl = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
    return fileUrl;
  } catch (error) {
    console.error('S3 Upload Error:', error);
    
    // Check if it's a credential error
    if (error.message.includes('Resolved credential object is not valid') || 
        error.message.includes('InvalidAccessKeyId') ||
        !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error('❌ AWS CREDENTIALS ERROR: Check your .env file!');
      console.error('Missing: AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY');
      throw new Error('S3 Upload failed: Invalid or missing AWS credentials. Check backend/.env file');
    }
    
    throw new Error(`S3 Upload failed: ${error.message}`);
  }
};

/**
 * Delete file from S3
 * @param {String} fileUrl - Full S3 file URL
 * @returns {Promise<Boolean>} Success status
 */
export const deleteFromS3 = async (fileUrl) => {
  try {
    const key = fileUrl.split(`${BUCKET_NAME}/`)[1];
    if (!key) throw new Error('Invalid S3 URL');

    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);
    
    return true;
  } catch (error) {
    console.error('S3 Delete Error:', error);
    throw new Error(`S3 Delete failed: ${error.message}`);
  }
};

export { s3Client, BUCKET_NAME, AWS_REGION };
