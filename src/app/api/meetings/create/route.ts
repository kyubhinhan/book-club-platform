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
      discussionId,
    } = await request.json();

    // TODO: Get clubId from authenticated user's context
    const clubId = 'temp-club-id'; // Temporary for development

    // Create meeting
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
      },
    });

    // Update discussion with meetingId
    await prisma.discussion.update({
      where: {
        id: discussionId,
      },
      data: {
        meetingId: meeting.id,
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
