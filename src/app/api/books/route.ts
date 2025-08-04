import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Book } from '@/types/book';

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

export async function POST(request: Request) {
  try {
    const bookData: Book = await request.json();

    // 필수 필드 검증
    if (!bookData.title || !bookData.author) {
      return NextResponse.json(
        { error: 'Title and author are required' },
        { status: 400 }
      );
    }

    // 이미 존재하는 책인지 확인
    const existingBook = await prisma.book.findFirst({
      where: {
        title: { contains: bookData.title },
        author: { contains: bookData.author },
      },
    });

    if (existingBook) {
      return NextResponse.json({
        book: existingBook,
        message: 'Book already exists',
      });
    }

    // 새 책 생성
    const newBook = await prisma.book.create({
      data: {
        title: bookData.title,
        author: bookData.author,
        description: bookData.description,
        isbn: bookData.isbn,
        category: bookData.category || '',
        imageUrl: bookData.imageUrl,
        link: bookData.link,
        publisher: bookData.publisher,
        price: bookData.price,
        pubDate: bookData.pubDate,
        recommendationReason: bookData.recommendationReason,
      },
    });

    return NextResponse.json({
      book: newBook,
      message: 'Book created successfully',
    });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
