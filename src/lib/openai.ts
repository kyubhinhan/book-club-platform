import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateBookTitles(category: string, count: number = 5) {
  const prompt = `한국에서 실제로 출간된 ${category} 분야의 책을 ${count}권 추천해주세요.
반드시 실제로 존재하는 책만 추천해주세요.
각 책의 제목만 알려주세요.

응답 형식:
제목: [정확한 책 제목]
---`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          '당신은 한국의 전문 독서 모임 큐레이터입니다. 한국에서 실제로 출간된 책들 중에서 독서 모임에 적합한 책을 추천해주세요. 가상의 책이나 존재하지 않는 책을 추천하지 마세요. 제목을 정확하게 제공하는 것이 매우 중요합니다.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.5,
  });

  return response.choices[0].message.content;
}

export async function generateBookRecommendationReason(
  bookTitle: string,
  bookAuthor: string,
  category: string
) {
  const prompt = `"${bookTitle}" (저자: ${bookAuthor})는 ${category} 분야의 책입니다.
이 책을 독서 모임에서 읽으면 좋은 이유를 한 문장으로 설명해주세요.
독서 모임의 관점에서 이 책이 어떤 가치가 있는지에 초점을 맞춰 간단하게 설명해주세요`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          '당신은 전문 독서 모임 큐레이터입니다. 책의 내용과 독서 모임에서의 활용 가치를 잘 알고 있습니다. 독서 모임에서 토론할 수 있는 주제나 이 책을 읽는 의미를 간단하게 설명해주세요. 반드시 한 문장으로 설명해주세요',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 150, // 토큰 제한으로 길이 제어
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
