import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateBookRecommendations(
  category: string,
  count: number = 5
) {
  const prompt = `독서 모임을 위한 ${category} 분야의 책을 ${count}권 추천해주세요. 각 책에 대해 제목, 저자, 간단한 설명을 포함해주세요.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          '당신은 전문 독서 모임 큐레이터입니다. 독서 모임에 적합한 책을 추천해주세요.',
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

export async function generateBookSummary(bookTitle: string, author: string) {
  const prompt = `"${bookTitle}" (저자: ${author})에 대한 간단한 소개와 이 책이 독서 모임에서 논의하기 좋은 이유를 설명해주세요.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          '당신은 전문 도서 큐레이터입니다. 책의 핵심 가치와 독서 모임에서의 활용 가치를 잘 설명해주세요.',
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
