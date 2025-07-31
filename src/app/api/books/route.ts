import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = 10; // 고정 10개

    // 카테고리별 필터링 조건
    const whereClause = category
      ? {
          category: category,
        }
      : {};

    // DB에서 데이터 조회
    const books = await prisma.book.findMany({
      where: whereClause,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // DB 데이터 반환
    return NextResponse.json({
      books,
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
