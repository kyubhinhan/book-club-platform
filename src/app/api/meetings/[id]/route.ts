import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const meetingId = params.id;

    const meeting = await prisma.meeting.findUnique({
      where: {
        id: meetingId,
      },
      include: {
        book: true,
        discussion: true,
        dateVotes: true,
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
    console.error('Meeting fetch error:', error);
    return NextResponse.json(
      { error: '모임 정보를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const meetingId = params.id;
    const { date } = await request.json();

    const meeting = await prisma.meeting.update({
      where: {
        id: meetingId,
      },
      data: {
        date: new Date(date),
      },
    });

    return NextResponse.json({ meeting });
  } catch (error) {
    console.error('Meeting update error:', error);
    return NextResponse.json(
      { error: '모임 정보 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
