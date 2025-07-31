import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateBookRecommendations } from '@/lib/openai';
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

async function findOrFetchBook(
  title: string,
  author: string,
  recommendationReason?: string
) {
  // 저자명의 '^' 를 ',' 로 변환
  const normalizedAuthor = author.replace(/\^/g, ', ');

  // 1. 데이터베이스에서 제목과 저자로 검색
  const existingBook = await prisma.book.findFirst({
    where: {
      AND: [
        { title: { contains: title } },
        { author: { contains: normalizedAuthor } },
      ],
    },
  });

  if (existingBook) {
    // 추천 이유가 있으면 업데이트
    if (
      recommendationReason &&
      existingBook.recommendationReason !== recommendationReason
    ) {
      return await prisma.book.update({
        where: { id: existingBook.id },
        data: {
          recommendationReason,
        },
      });
    }
    return existingBook;
  }

  // 2. 데이터베이스에 없으면 네이버 API로 검색
  const bookInfo = await searchBookByTitleAndAuthor(title, normalizedAuthor);

  if (!bookInfo.success || !bookInfo.book) {
    return null;
  }

  // 3. 검색 결과를 데이터베이스에 저장
  return await prisma.book.create({
    data: {
      title: bookInfo.book.title,
      author: bookInfo.book.author.replace(/\^/g, ', '), // 저자명의 '^' 를 ',' 로 변환
      description: bookInfo.book.description,
      isbn: bookInfo.book.isbn,
      category: '', // 카테고리는 나중에 설정
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

    // AI 추천 생성
    const recommendationsText = await generateBookRecommendations(
      category,
      count + 2
    );

    if (!recommendationsText) {
      return NextResponse.json(
        { error: 'Failed to generate recommendations' },
        { status: 500 }
      );
    }

    const recommendations = parseRecommendations(recommendationsText);
    const aiBooks = [];

    for (const rec of recommendations) {
      if (aiBooks.length >= count) break;

      const book = await findOrFetchBook(rec.title, rec.author, rec.reason);

      if (book) {
        // 카테고리 업데이트
        const updatedBook = await prisma.book.update({
          where: { id: book.id },
          data: {
            category,
            recommendationReason: rec.reason,
          },
        });

        aiBooks.push({
          ...updatedBook,
          isbn: updatedBook.isbn?.toString(),
          summary: updatedBook.recommendationReason || rec.reason,
        });
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
