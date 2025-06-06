import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { ids } = await request.json();

    console.log(ids);

    if (!Array.isArray(ids)) {
      return NextResponse.json(
        { error: '도서 ID 목록이 필요합니다.' },
        { status: 400 }
      );
    }

    const books = await prisma.book.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    // ISBN을 문자열로 변환
    const booksWithStringIsbn = books.map((book) => ({
      ...book,
      isbn: book.isbn?.toString(),
    }));

    return NextResponse.json({ books: booksWithStringIsbn });
  } catch (error) {
    console.error('Error fetching books by IDs:', error);
    return NextResponse.json(
      { error: '도서 정보를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
