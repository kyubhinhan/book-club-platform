import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
    const discussionId = id;

    const discussion = await prisma.discussion.findUnique({
      where: {
        id: discussionId,
      },
      include: {
        book: true,
      },
    });

    if (!discussion) {
      return NextResponse.json(
        { error: '발제문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(discussion);
  } catch (error) {
    console.error('Discussion fetch error:', error);
    return NextResponse.json(
      { error: '발제문을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
