import { NextResponse } from 'next/server';
import { generateBookRecommendations, generateBookSummary } from '@/lib/openai';
import prisma from '@/lib/prisma';

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
    const recommendationsText = await generateBookRecommendations(category, count);
    
    // 추천된 도서들을 파싱하고 데이터베이스에 저장
    const books = await parseAndSaveBooks(recommendationsText, category);

    return NextResponse.json({ books });
  } catch (error) {
    console.error('Book recommendation error:', error);
    return NextResponse.json(
      { error: '도서 추천 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

async function parseAndSaveBooks(recommendationsText: string, category: string) {
  // 텍스트를 파싱하여 책 정보 추출
  const books = [];
  const bookEntries = recommendationsText.split('\n\n');

  for (const entry of bookEntries) {
    if (!entry.trim()) continue;

    // 기본적인 파싱 로직 (실제 응답 형식에 따라 조정 필요)
    const titleMatch = entry.match(/제목:\s*(.+)/i) || entry.match(/^(.+?)(?:\s*-|$)/);
    const authorMatch = entry.match(/저자:\s*(.+)/i) || entry.match(/저자:\s*(.+)/);
    const descriptionMatch = entry.match(/설명:\s*(.+)/i) || entry.match(/\n(.+)$/);

    if (titleMatch) {
      const title = titleMatch[1].trim();
      const author = authorMatch ? authorMatch[1].trim() : '저자 미상';
      const description = descriptionMatch ? descriptionMatch[1].trim() : '';

      // 책 정보를 데이터베이스에 저장
      const book = await prisma.book.create({
        data: {
          title,
          author,
          description,
          category,
        },
      });

      // 책에 대한 추가 설명 생성
      const summary = await generateBookSummary(title, author);
      
      books.push({
        ...book,
        summary,
      });
    }
  }

  return books;
} 