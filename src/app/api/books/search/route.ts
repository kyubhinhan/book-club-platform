import { NextResponse } from 'next/server';
import { searchBooksWithPagination } from '@/lib/books';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const start = (page - 1) * limit + 1;

    if (!query || !query.trim()) {
      return NextResponse.json(
        { error: '검색어가 필요합니다.' },
        { status: 400 }
      );
    }

    const result = await searchBooksWithPagination(query, start, limit);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || '검색에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      books: result.books,
      total: result.total,
      hasMore: result.hasMore,
    });
  } catch (error) {
    console.error('Error searching books:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
