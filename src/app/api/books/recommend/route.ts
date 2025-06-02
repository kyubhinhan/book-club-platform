import { NextResponse } from 'next/server';
import { generateBookRecommendations } from '@/lib/openai';
import { prisma } from '@/lib/prisma';
import { searchBookByTitleAndAuthor } from '@/lib/books';

interface BookRecommendation {
  title: string;
  author: string;
  reason: string;
}

function parseRecommendations(text: string): BookRecommendation[] {
  const books: BookRecommendation[] = [];
  const entries = text.split('\n---\n');

  for (const entry of entries) {
    if (!entry.trim()) continue;

    const titleMatch = entry.match(/제목:\s*(.+)/);
    const authorMatch = entry.match(/저자:\s*(.+)/);
    const reasonMatch = entry.match(/추천 이유:\s*(.+)/);

    if (titleMatch && authorMatch && reasonMatch) {
      books.push({
        title: titleMatch[1].trim(),
        author: authorMatch[1].trim(),
        reason: reasonMatch[1].trim(),
      });
    }
  }

  return books;
}

async function findOrFetchBook(title: string, author: string) {
  // 1. 데이터베이스에서 제목과 저자로 검색
  const existingBook = await prisma.book.findFirst({
    where: {
      AND: [{ title: { contains: title } }, { author: { contains: author } }],
    },
  });

  if (existingBook) {
    return existingBook;
  }

  // 2. 데이터베이스에 없으면 네이버 API로 검색
  const bookInfo = await searchBookByTitleAndAuthor(title, author);

  if (!bookInfo.success || !bookInfo.book) {
    return null;
  }

  // 3. 검색 결과를 데이터베이스에 저장
  return await prisma.book.create({
    data: {
      title: bookInfo.book.title,
      author: bookInfo.book.author,
      description: bookInfo.book.description,
      isbn: bookInfo.book.isbn,
      category: '', // 카테고리는 나중에 설정
      imageUrl: bookInfo.book.imageUrl,
      publisher: bookInfo.book.publisher,
      price: bookInfo.book.price,
      pubDate: bookInfo.book.pubDate,
    },
  });
}

export async function POST(request: Request) {
  try {
    const { category, count = 5 } = await request.json();

    if (!category) {
      return NextResponse.json(
        { error: '카테고리는 필수 입력값입니다.' },
        { status: 400 }
      );
    }

    const validBooks = [];
    let attempts = 0;
    const maxAttempts = 3; // 최대 3번까지 시도

    while (validBooks.length < count && attempts < maxAttempts) {
      // AI를 통한 도서 추천 받기 (남은 개수만큼 요청)
      const remainingCount = count - validBooks.length;
      const recommendationsText = await generateBookRecommendations(
        category,
        remainingCount + 2 // 여유있게 2개 더 요청
      );

      if (!recommendationsText) {
        return NextResponse.json(
          { error: '도서 추천을 생성하는데 실패했습니다.' },
          { status: 500 }
        );
      }

      // 추천된 도서 파싱
      const recommendations = parseRecommendations(recommendationsText);

      // 각 도서 정보 조회 및 저장
      for (const rec of recommendations) {
        if (validBooks.length >= count) break;

        const book = await findOrFetchBook(rec.title, rec.author);

        if (book) {
          // 카테고리 업데이트
          const updatedBook = await prisma.book.update({
            where: { id: book.id },
            data: { category },
          });

          validBooks.push({
            ...updatedBook,
            isbn: updatedBook.isbn?.toString(),
            summary: rec.reason,
          });
        }
      }

      attempts++;
    }

    if (validBooks.length === 0) {
      return NextResponse.json(
        { error: '유효한 도서를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ books: validBooks });
  } catch (error) {
    console.error('Book recommendation error:', error);
    return NextResponse.json(
      { error: '도서 추천 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
