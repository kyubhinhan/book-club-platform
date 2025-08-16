import { v2 as cloudinary } from 'cloudinary';
import { CLIENT_FILE_UPLOAD_CONFIG } from '@/utils/clientFileUpload';

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 첨부파일 업로드
export const uploadToCloudinary = async (
  buffer: Buffer,
  meetingId: string,
  mimeType?: string
) => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8); // 6자리 랜덤 문자열

  // 파일 타입에 따른 업로드 설정 결정
  const isDocument =
    mimeType &&
    (mimeType.startsWith('application/') || mimeType.startsWith('text/'));

  const uploadOptions: Record<string, unknown> = {
    folder: `book-club/meetings/${meetingId}`,
    public_id: `${meetingId}_${timestamp}_${randomId}`,
    resource_type: 'auto',
    allowed_formats: [...CLIENT_FILE_UPLOAD_CONFIG.ALLOWED_EXTENSIONS],
  };

  // 문서 파일이 아닌 경우에만 이미지 변환 적용
  if (!isDocument) {
    uploadOptions.transformation = [
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ];
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
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

// 첨부파일 다운로드
export const downloadFromCloudinary = async (publicId: string) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    const response = await fetch(result.url);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return buffer;
  } catch (error) {
    throw new Error(`파일 다운로드에 실패했습니다: ${error}`);
  }
};

export const deleteFromCloudinary = async (publicId: string) => {
  return cloudinary.uploader.destroy(publicId);
};

export default cloudinary;
