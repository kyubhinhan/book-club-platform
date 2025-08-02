import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  generateBookTitles,
  generateBookRecommendationReason,
} from '@/lib/openai';
import { searchBookByTitle } from '@/lib/books';

function parseBookTitles(text: string): string[] {
  const titles: string[] = [];

  if (!text) return titles;

  // 응답 형식에 맞춰 파싱
  const entries = text.split('---');

  for (const entry of entries) {
    if (!entry.trim()) continue;

    // 실제 응답 형식: 제목만
    const lines = entry
      .trim()
      .split('\n')
      .filter((line) => line.trim());

    if (lines.length >= 1) {
      // 제목 처리: "제목:" 형식이거나 바로 제목이 올 수 있음
      let title = lines[0].trim();
      const titleMatch = title.match(/^제목:\s*(.+)/);
      if (titleMatch) {
        title = titleMatch[1].trim();
      }

      // 작은따옴표 제거
      title = title.replace(/^['"]|['"]$/g, '');

      if (title) {
        titles.push(title);
      }
    }
  }

  return titles;
}

async function findOrFetchBook(
  title: string,
  category: string,
  recommendationReason?: string
) {
  // 1. 데이터베이스에서 제목으로 검색
  const existingBook = await prisma.book.findFirst({
    where: {
      AND: [{ title: { contains: title } }],
    },
  });

  if (existingBook) {
    return existingBook;
  }

  // 2. 데이터베이스에 없으면 네이버 API로 검색
  const bookInfo = await searchBookByTitle(title);

  if (!bookInfo.success || !bookInfo.book) {
    return null;
  }

  // 3. 네이버 API 검색 결과가 이미 DB에 있는지 다시 확인
  const existingBookByTitle = await prisma.book.findFirst({
    where: {
      title: { contains: bookInfo.book.title },
    },
  });

  if (existingBookByTitle) {
    return existingBookByTitle;
  }

  // 4. 검색 결과를 데이터베이스에 저장
  return await prisma.book.create({
    data: {
      title: bookInfo.book.title,
      author: bookInfo.book.author.replace(/\^/g, ', '), // 저자명의 '^' 를 ',' 로 변환
      description: bookInfo.book.description,
      isbn: bookInfo.book.isbn,
      category,
      link: bookInfo.book.link,
      imageUrl: bookInfo.book.imageUrl,
      publisher: bookInfo.book.publisher,
      price: bookInfo.book.price,
      pubDate: bookInfo.book.pubDate,
      recommendationReason, // 추천 이유 저장
    },
  });
}

export async function POST(request: Request) {
  try {
    const { category, count = 10 } = await request.json();

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    // 1단계: 책 제목만 추천받기
    const bookTitlesText = await generateBookTitles(
      category,
      count * 3 // 충분한 수의 추천을 받기 위해 3배로 요청
    );

    if (!bookTitlesText) {
      return NextResponse.json(
        { error: 'Failed to generate book titles' },
        { status: 500 }
      );
    }

    const bookTitles = parseBookTitles(bookTitlesText);
    if (bookTitles.length === 0)
      return NextResponse.json(
        { error: 'Failed to parse book titles' },
        { status: 500 }
      );

    const aiBooks = [];
    const processedBookIds = new Set<string>(); // 이미 처리된 책 ID 추적
    let attempts = 0;
    const maxAttempts = count * 5; // 최대 시도 횟수 제한

    for (const bookTitle of bookTitles) {
      if (aiBooks.length >= count || attempts >= maxAttempts) break;
      attempts++;

      // 2단계: 책의 제목으로 책이 실제로 존재하는지 확인하고 가져오기
      const book = await findOrFetchBook(bookTitle, category);

      if (book) {
        // 이미 처리된 책인지 확인
        if (processedBookIds.has(book.id)) {
          continue; // 이미 처리된 책이면 넘어가기
        }

        // 3단계: 존재하는 책에 대해 추천 이유 생성
        const recommendationReason = await generateBookRecommendationReason(
          book.title,
          book.author,
          category
        );

        // 추천 이유 업데이트
        const updatedBook = await prisma.book.update({
          where: { id: book.id },
          data: {
            recommendationReason:
              recommendationReason ||
              `${book.title}은(는) ${category} 분야의 추천 도서입니다.`,
          },
        });

        aiBooks.push({
          ...updatedBook,
          isbn: updatedBook.isbn?.toString(),
          summary: updatedBook.recommendationReason,
        });

        // 처리된 책 ID를 Set에 추가
        processedBookIds.add(book.id);
      }
    }

    return NextResponse.json({
      books: aiBooks,
    });
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
