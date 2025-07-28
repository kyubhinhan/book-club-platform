import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { Session } from 'next-auth';

export async function GET() {
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

    const userId = session.user.id;

    const meetings = await prisma.meeting.findMany({
      where: {
        creatorId: userId,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            imageUrl: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        discussion: {
          select: {
            id: true,
            questions: true,
          },
        },
      },
      orderBy: {
        meetingDate: 'desc',
      },
    });

    return NextResponse.json({ meetings });
  } catch (error) {
    console.error('Error fetching my meetings:', error);
    return NextResponse.json(
      { error: '내 모임 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
