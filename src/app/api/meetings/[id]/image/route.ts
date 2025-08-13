import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { Session } from 'next-auth';
import { uploadToCloudinary } from '@/lib/cloudinary';
import type { UploadApiResponse } from 'cloudinary';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = (await getServerSession(
      authOptions as any
    )) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const meetingId = params.id;

    // 기존 모임 확인
    const existingMeeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        creator: true,
      },
    });

    if (!existingMeeting) {
      return NextResponse.json(
        { error: '모임을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 생성자만 이미지 업로드 가능
    if (existingMeeting.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: '이미지를 업로드할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: '이미지 파일이 필요합니다.' },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '이미지 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: '파일 크기는 5MB 이하여야 합니다.' },
        { status: 400 }
      );
    }

    // Cloudinary에 이미지 업로드
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = (await uploadToCloudinary(
      buffer,
      meetingId
    )) as UploadApiResponse;

    if (!uploadResult.secure_url) {
      return NextResponse.json(
        { error: '이미지 업로드에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 모임의 imageUrl 업데이트
    const updatedMeeting = await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        imageUrl: uploadResult.secure_url,
      },
    });

    return NextResponse.json({
      imageUrl: uploadResult.secure_url,
      meeting: updatedMeeting,
    });
  } catch (error) {
    console.error('Error uploading meeting image:', error);
    return NextResponse.json(
      { error: '이미지 업로드에 실패했습니다.' },
      { status: 500 }
    );
  }
}
