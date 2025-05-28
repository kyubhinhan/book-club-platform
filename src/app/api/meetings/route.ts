import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { title, location, dateOptions, bookId } = await request.json();

    // 모임 생성
    const meeting = await prisma.meeting.create({
      data: {
        title,
        location,
        date: new Date(dateOptions[0].date), // 첫 번째 날짜를 기본값으로 설정
        bookId,
        clubId: '', // TODO: 실제 클럽 ID로 대체 필요
      },
    });

    // 날짜 옵션들을 저장
    const dateVotes = await prisma.$transaction(
      dateOptions.map((option: { date: string }) =>
        prisma.meetingDateVote.create({
          data: {
            meetingId: meeting.id,
            date: new Date(option.date),
            votes: 0,
          },
        })
      )
    );

    return NextResponse.json({
      meeting: {
        ...meeting,
        dateVotes,
      },
    });
  } catch (error) {
    console.error('Meeting creation error:', error);
    return NextResponse.json(
      { error: '모임 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');

    const meetings = await prisma.meeting.findMany({
      where: {
        clubId: clubId || undefined,
      },
      include: {
        book: true,
        discussion: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json({ meetings });
  } catch (error) {
    console.error('Meetings fetch error:', error);
    return NextResponse.json(
      { error: '모임 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
