import { v2 as cloudinary } from 'cloudinary';
import { CLIENT_FILE_UPLOAD_CONFIG } from '@/utils/clientFileUpload';

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 첨부파일 업로드
export const uploadToCloudinary = async (buffer: Buffer, meetingId: string) => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8); // 6자리 랜덤 문자열

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `book-club/meetings/${meetingId}`,
        public_id: `${meetingId}_${timestamp}_${randomId}`,
        resource_type: 'auto',
        allowed_formats: [...CLIENT_FILE_UPLOAD_CONFIG.ALLOWED_EXTENSIONS],
        transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string) => {
  return cloudinary.uploader.destroy(publicId);
};

export default cloudinary;
