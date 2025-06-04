import { NextResponse } from 'next/server';
import { generateDiscussionQuestions } from '@/lib/openai';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { bookId, questionCount = 5 } = await request.json();

    if (!bookId) {
      return NextResponse.json(
        { error: '도서 ID는 필수 입력값입니다.' },
        { status: 400 }
      );
    }

    // 도서 정보 조회
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return NextResponse.json(
        { error: '해당하는 도서를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // AI를 통한 발제문 생성
    const questionsText = await generateDiscussionQuestions(
      book.title,
      book.description ?? '',
      questionCount
    );

    if (!questionsText) {
      return NextResponse.json(
        { error: '발제문 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 발제문 반환 (저장하지 않음)
    return NextResponse.json({
      discussion: {
        questions: parseQuestions(questionsText),
        bookId: book.id,
      },
    });
  } catch (error) {
    console.error('Discussion generation error:', error);
    return NextResponse.json(
      { error: '발제문 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

function parseQuestions(questionsText: string): string[] {
  // 텍스트에서 질문들을 추출
  const questions = questionsText
    .split('\n')
    .filter((line) => line.trim().match(/^\d+[\.\)]\s+.+/)) // 숫자로 시작하는 라인만 선택
    .map((line) => line.replace(/^\d+[\.\)]\s+/, '').trim()); // 숫자와 구분자 제거

  return questions;
}
