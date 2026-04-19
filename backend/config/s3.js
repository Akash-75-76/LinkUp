import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
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
console.log("AWS KEY:", process.env.AWS_ACCESS_KEY_ID);
console.log("AWS SECRET:", process.env.AWS_SECRET_ACCESS_KEY ? "present" : "missing");
console.log("BUCKET:", process.env.AWS_S3_BUCKET);
export { s3Client, BUCKET_NAME, AWS_REGION };
