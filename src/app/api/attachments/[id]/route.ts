import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: params.id },
      include: {
        meeting: {
          select: {
            title: true,
            book: {
              select: {
                title: true,
                author: true,
              },
            },
          },
        },
      },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: '첨부파일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ attachment });
  } catch (error) {
    console.error('Attachment fetch error:', error);
    return NextResponse.json(
      { error: '첨부파일 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
