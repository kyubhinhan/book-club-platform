import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { Session } from 'next-auth';
import { deleteCloudinaryImageByUrl } from '@/lib/cloudinary';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meetingId = params.id;

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        book: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        discussion: {
          include: {
            book: true,
          },
        },
      },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: '모임을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ meeting });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    return NextResponse.json(
      { error: '모임 정보를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const formData = await request.formData();

    // 폼 데이터에서 currentImageUrl 추출
    const currentImageUrl = formData.get('currentImageUrl') as string;

    // 기존 모임 확인
    const existingMeeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        creator: true,
        discussion: true,
      },
    });

    if (!existingMeeting) {
      return NextResponse.json(
        { error: '모임을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 생성자만 수정 가능
    if (existingMeeting.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: '모임을 수정할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 이미지가 변경되었거나 삭제된 경우 기존 이미지 삭제
    const imageChanged = existingMeeting.imageUrl !== currentImageUrl;
    if (imageChanged && existingMeeting.imageUrl) {
      await deleteCloudinaryImageByUrl(existingMeeting.imageUrl);
    }

    // 폼 데이터 추출
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const meetingDate = formData.get('meetingDate') as string;
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;
    const maxParticipants = parseInt(formData.get('maxParticipants') as string);
    const address = formData.get('address') as string;
    const detailedAddress = formData.get('detailedAddress') as string;
    const recommendationReason = formData.get('recommendationReason') as string;
    const range = formData.get('range') as string;
    const questions = JSON.parse(formData.get('questions') as string);

    // 모임 업데이트
    const updatedMeeting = await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        title,
        description,
        meetingDate: new Date(meetingDate),
        startTime,
        endTime,
        maxParticipants,
        address,
        detailedAddress,
        recommendationReason,
        range,
        // 이미지가 변경된 경우 currentImageUrl로 설정 (null이면 삭제됨)
        ...(imageChanged && { imageUrl: currentImageUrl || null }),
      },
    });

    // 발제문 업데이트
    if (existingMeeting.discussion) {
      await prisma.discussion.update({
        where: { id: existingMeeting.discussion.id },
        data: {
          questions,
        },
      });
    }

    return NextResponse.json({ meeting: updatedMeeting });
  } catch (error) {
    console.error('Error updating meeting:', error);
    return NextResponse.json(
      { error: '모임 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
        discussion: true,
        attachments: true,
      },
    });

    if (!existingMeeting) {
      return NextResponse.json(
        { error: '모임을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 생성자만 삭제 가능
    if (existingMeeting.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: '모임을 삭제할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 관련 데이터 삭제 (순서 중요: 외래키 제약조건 때문)
    // 1. Cloudinary 이미지 삭제
    if (existingMeeting.imageUrl) {
      await deleteCloudinaryImageByUrl(existingMeeting.imageUrl);
    }

    // 2. 첨부파일 삭제
    if (existingMeeting.attachments.length > 0) {
      await prisma.attachment.deleteMany({
        where: { meetingId: meetingId },
      });
    }

    // 3. 발제문 삭제
    if (existingMeeting.discussion) {
      await prisma.discussion.delete({
        where: { id: existingMeeting.discussion.id },
      });
    }

    // 4. 모임 삭제
    await prisma.meeting.delete({
      where: { id: meetingId },
    });

    return NextResponse.json({ message: '모임이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return NextResponse.json(
      { error: '모임 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
