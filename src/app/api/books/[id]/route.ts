import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const book = await prisma.book.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!book) {
      return NextResponse.json(
        { error: '책을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json(
      { error: '책 정보를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
