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

async function getRandomBooksFromDB(
  category: string,
  count: number,
  excludeIds: string[]
) {
  return await prisma.book.findMany({
    where: {
      category,
      id: {
        notIn: excludeIds,
      },
    },
    orderBy: {
      id: 'desc',
    },
    take: count,
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
    const maxAttempts = 3;
    const addedBookIds = new Set<string>(); // 명시적으로 string 타입 지정

    while (validBooks.length < count && attempts < maxAttempts) {
      const remainingCount = count - validBooks.length;
      const recommendationsText = await generateBookRecommendations(
        category,
        remainingCount + 2
      );

      if (!recommendationsText) {
        return NextResponse.json(
          { error: '도서 추천을 생성하는데 실패했습니다.' },
          { status: 500 }
        );
      }

      const recommendations = parseRecommendations(recommendationsText);

      for (const rec of recommendations) {
        if (validBooks.length >= count) break;

        const book = await findOrFetchBook(rec.title, rec.author, rec.reason);

        if (book && !addedBookIds.has(book.id)) {
          // 중복 체크 추가
          addedBookIds.add(book.id); // ID를 Set에 추가
          const updatedBook = await prisma.book.update({
            where: { id: book.id },
            data: {
              category,
              recommendationReason: rec.reason,
            },
          });

          validBooks.push({
            ...updatedBook,
            isbn: updatedBook.isbn?.toString(),
            summary: updatedBook.recommendationReason || rec.reason,
          });
        }
      }

      attempts++;
    }

    // AI 추천으로 충분한 책을 못 찾았다면 DB에서 추가
    if (validBooks.length < count) {
      const remainingCount = count - validBooks.length;
      const existingIds: string[] = Array.from(addedBookIds); // 명시적으로 string[] 타입 지정

      const additionalBooks = await getRandomBooksFromDB(
        category,
        remainingCount,
        existingIds
      );

      validBooks.push(
        ...additionalBooks.map((book) => ({
          ...book,
          isbn: book.isbn?.toString(),
          summary:
            book.recommendationReason ||
            '이 분야의 인기 도서로, 많은 독자들에게 좋은 평가를 받았습니다.',
        }))
      );
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
