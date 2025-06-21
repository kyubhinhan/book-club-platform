import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';
import { FILE_UPLOAD_CONFIG, fileUploadUtils } from '@/config/fileUpload';

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  resource_type: string;
  bytes: number;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const meetingId = formData.get('meetingId') as string;

    if (!meetingId) {
      return NextResponse.json(
        { error: 'meetingId가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: '업로드할 파일이 없습니다.' },
        { status: 400 }
      );
    }

    const savedAttachments = [];

    for (const file of files) {
      // 파일 크기 검증
      if (!fileUploadUtils.isValidFileSize(file.size)) {
        return NextResponse.json(
          {
            error: `${file.name} 파일이 너무 큽니다. (최대 ${fileUploadUtils.formatFileSize(FILE_UPLOAD_CONFIG.MAX_FILE_SIZE)}MB)`,
          },
          { status: 400 }
        );
      }

      // 파일 형식 검증
      if (!fileUploadUtils.isValidMimeType(file.type)) {
        return NextResponse.json(
          { error: `${file.name} 파일 형식이 지원되지 않습니다.` },
          { status: 400 }
        );
      }

      // 파일을 Cloudinary에 업로드
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Cloudinary 업로드
      const uploadResult = await new Promise<CloudinaryUploadResult>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: fileUploadUtils.getCloudinaryFolder(meetingId),
              resource_type: FILE_UPLOAD_CONFIG.CLOUDINARY.RESOURCE_TYPE,
              allowed_formats: [...FILE_UPLOAD_CONFIG.ALLOWED_EXTENSIONS],
              transformation: FILE_UPLOAD_CONFIG.CLOUDINARY.TRANSFORMATIONS,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as CloudinaryUploadResult);
            }
          );

          uploadStream.end(buffer);
        }
      );

      // DB에 파일 정보 저장
      const attachment = await prisma.attachment.create({
        data: {
          filename: uploadResult.public_id,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          path: uploadResult.secure_url, // Cloudinary HTTPS URL
          meetingId,
        },
      });

      savedAttachments.push(attachment);
    }

    return NextResponse.json({
      message: '파일이 성공적으로 업로드되었습니다.',
      attachments: savedAttachments,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: '파일 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
