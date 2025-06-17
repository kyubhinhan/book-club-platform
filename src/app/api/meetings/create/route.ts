import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      maxParticipants,
      meetingType,
      location,
      meetingDay,
      meetingTime,
      meetingFrequency,
      bookId,
      questions,
    } = await request.json();

    // TODO: Get clubId from authenticated user's context
    const clubId = 'temp-club-id'; // Temporary for development

    // 1. discussion 생성
    const discussion = await prisma.discussion.create({
      data: {
        questions,
        bookId,
      },
    });

    // 2. meeting 생성 (discussionId 연결)
    const meeting = await prisma.meeting.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        maxParticipants,
        meetingType,
        location: meetingType === 'offline' ? location : null,
        meetingDay,
        meetingTime,
        meetingFrequency,
        bookId,
        clubId,
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
