import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { dateId } = await request.json();
    const meetingId = params.id;

    // TODO: 사용자 인증 추가 필요
    // const userId = 'current-user-id';

    // 투표 기록 생성 또는 업데이트
    const vote = await prisma.meetingDateVote.update({
      where: {
        id: dateId,
        meetingId,
      },
      data: {
        votes: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ vote });
  } catch (error) {
    console.error('Vote creation error:', error);
    return NextResponse.json(
      { error: '투표 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const meetingId = params.id;

    const votes = await prisma.meetingDateVote.findMany({
      where: {
        meetingId,
      },
      orderBy: {
        votes: 'desc',
      },
    });

    return NextResponse.json({ votes });
  } catch (error) {
    console.error('Votes fetch error:', error);
    return NextResponse.json(
      { error: '투표 결과를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 