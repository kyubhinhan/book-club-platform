import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ISBN-13 검증 함수
function isValidISBN13(isbn: bigint): boolean {
  const isbnString = isbn.toString();
  // 1. 길이가 13자리인지 확인
  if (!/^\d{13}$/.test(isbnString)) {
    return false;
  }

  // 2. ISBN-13 체크섬 검증
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(isbnString[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(isbnString[12]);
}

export async function generateBookRecommendations(
  category: string,
  count: number = 5
) {
  const prompt = `한국에서 실제로 출간된 ${category} 분야의 책을 ${count}권 추천해주세요.
반드시 실제로 존재하는 책만 추천해주세요.
각 책의 제목과 저자명을 정확하게 알려주세요.

응답 형식:
제목: [정확한 책 제목]
저자: [정확한 저자 이름]
---`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          '당신은 한국의 전문 독서 모임 큐레이터입니다. 한국에서 실제로 출간된 책들 중에서 독서 모임에 적합한 책을 추천해주세요. 가상의 책이나 존재하지 않는 책을 추천하지 마세요. 제목과 저자명을 정확하게 제공하는 것이 매우 중요합니다.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.5, // 더 정확한 응답을 위해 temperature 낮춤
  });

  return response.choices[0].message.content;
}

export async function generateDiscussionQuestions(
  bookTitle: string,
  bookDescription: string,
  questionCount: number = 5
) {
  const prompt = `"${bookTitle}"에 대한 독서 모임 발제 질문 ${questionCount}개를 생성해주세요. 책 설명: ${bookDescription}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          '당신은 전문 독서 토론 진행자입니다. 책의 핵심 주제와 의미를 깊이 있게 탐구할 수 있는 질문들을 제시해주세요.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content;
}

export async function generateBookSummary(isbn: bigint) {
  // ISBN 형식 검증
  if (!isbn) {
    throw new Error('ISBN이 제공되지 않았습니다.');
  }

  if (!isValidISBN13(isbn)) {
    throw new Error('유효하지 않은 ISBN-13 형식입니다.');
  }

  const prompt = `ISBN이 ${isbn}인 책에 대해 다음 형식으로 답변해주세요:

1. 책 소개 (2-3문장):
[이 책의 핵심 내용을 간단히 설명]

2. 독서 모임 추천 이유 (정확히 3가지):
1) [첫 번째 이유]
2) [두 번째 이유]
3) [세 번째 이유]`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          '당신은 전문 도서 큐레이터입니다. ISBN을 참고하여 해당 책에 대해 독서 모임에서 논의하기 좋은 3가지 핵심 포인트를 명확하게 제시해주세요. 각 포인트는 구체적이고 토론을 이끌어낼 수 있어야 합니다.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content;
}
