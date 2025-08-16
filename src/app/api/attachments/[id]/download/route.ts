import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { downloadFromCloudinary } from '@/lib/cloudinary';
import { getMimeType } from '@/utils/clientFileUpload';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: params.id },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: '첨부파일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Cloudinary에서 파일 다운로드
    try {
      const buffer = await downloadFromCloudinary(attachment.filename);

      // 정확한 MIME 타입 결정
      const mimeType = getMimeType(
        attachment.originalName,
        attachment.mimeType
      );

      const headers: Record<string, string> = {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(attachment.originalName)}"`,
        'Content-Length': buffer.length.toString(),
      };

      // PDF 파일의 경우 추가 헤더 설정
      if (mimeType === 'application/pdf') {
        headers['Content-Type'] = 'application/pdf';
        headers['Accept-Ranges'] = 'bytes';
        headers['Cache-Control'] = 'no-cache';
      }

      return new NextResponse(buffer, { headers });
    } catch (cloudinaryError) {
      console.error('Cloudinary download error:', cloudinaryError);
      return NextResponse.json(
        { error: '파일 다운로드 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Attachment download error:', error);
    return NextResponse.json(
      { error: '첨부파일 다운로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
