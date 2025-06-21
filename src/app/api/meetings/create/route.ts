import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MeetingData } from '@/types/meeting';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const data: MeetingData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      meetingDate: formData.get('meetingDate') as string,
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
      maxParticipants: parseInt(formData.get('maxParticipants') as string),
      location: formData.get('location') as string,
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
      location,
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

    // 2. meeting 생성 (clubId 없이)
    const meeting = await prisma.meeting.create({
      data: {
        title,
        description,
        meetingDate: new Date(meetingDate),
        startTime,
        endTime,
        maxParticipants,
        location,
        recommendationReason,
        range,
        bookId,
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
