import { NextResponse } from 'next/server';
import { generateBookRecommendations, generateBookSummary } from '@/lib/openai';
import { prisma } from '@/lib/prisma';
import { searchBookByTitleAndAuthor } from '@/lib/books';

interface BookRecommendation {
  title: string;
  author: string;
}

function parseRecommendations(text: string): BookRecommendation[] {
  const books: BookRecommendation[] = [];
  const entries = text.split('\n---\n');

  for (const entry of entries) {
    if (!entry.trim()) continue;

    const titleMatch = entry.match(/제목:\s*(.+)/);
    const authorMatch = entry.match(/저자:\s*(.+)/);

    if (titleMatch && authorMatch) {
      books.push({
        title: titleMatch[1].trim(),
        author: authorMatch[1].trim(),
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
  console.log(bookInfo);

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

    // AI를 통한 도서 추천 받기
    const recommendationsText = await generateBookRecommendations(
      category,
      count
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
    const books = [];
    for (const rec of recommendations) {
      const book = await findOrFetchBook(rec.title, rec.author);
      if (book) {
        // 카테고리 업데이트
        const updatedBook = await prisma.book.update({
          where: { id: book.id },
          data: { category },
        });

        try {
          // 책에 대한 추가 설명 생성
          const summary = await generateBookSummary(updatedBook.isbn!);
          books.push({
            ...updatedBook,
            isbn: updatedBook.isbn?.toString(),
            summary,
          });
        } catch (error) {
          console.error(`도서 설명 생성 중 오류:`, error);
          books.push({
            ...updatedBook,
            isbn: updatedBook.isbn?.toString(),
            summary: '도서 설명을 생성하는 중 오류가 발생했습니다.',
          });
        }
      }
    }

    return NextResponse.json({ books });
  } catch (error) {
    console.error('Book recommendation error:', error);
    return NextResponse.json(
      { error: '도서 추천 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
