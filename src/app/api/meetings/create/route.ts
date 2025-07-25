import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { MeetingData } from '@/types/meeting';
import { Session } from 'next-auth';

export async function POST(request: Request) {
  try {
    // 로그인한 사용자 정보 가져오기
    const session = (await getServerSession(
      authOptions as any
    )) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const creatorId = session.user.id;

    const formData = await request.formData();

    const data: MeetingData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      meetingDate: formData.get('meetingDate') as string,
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
      maxParticipants: parseInt(formData.get('maxParticipants') as string),
      address: formData.get('address') as string,
      detailedAddress: formData.get('detailedAddress') as string,
      recommendationReason: formData.get('recommendationReason') as string,
      range: formData.get('range') as string,
      bookId: formData.get('bookId') as string,
      questions: formData.get('questions') as string,
    };

    const {
      title,
      description,
      meetingDate,
      startTime,
      endTime,
      maxParticipants,
      address,
      detailedAddress,
      recommendationReason,
      range,
      bookId,
      questions,
    } = data;

    // TODO: Get clubId from authenticated user's context
    // 테스트를 위해 clubId 없이 생성

    // 1. discussion 생성
    const discussion = await prisma.discussion.create({
      data: {
        questions: JSON.parse(questions),
        bookId,
      },
    });

    // 2. meeting 생성 (creatorId 포함)
    const meeting = await prisma.meeting.create({
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
        bookId,
        creatorId, // 로그인한 사용자의 ID를 creator로 설정
        // clubId 제거 - 선택적 필드이므로 생략 가능
        discussion: { connect: { id: discussion.id } },
      },
    });

    return NextResponse.json({ meeting });
  } catch (error) {
    console.error('Meeting creation error:', error);
    return NextResponse.json(
      { error: '모임 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
