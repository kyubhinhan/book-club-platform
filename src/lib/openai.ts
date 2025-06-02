import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateBookRecommendations(
  category: string,
  count: number = 5
) {
  const prompt = `한국에서 실제로 출간된 ${category} 분야의 책을 ${count}권 추천해주세요.
반드시 실제로 존재하는 책만 추천해주세요.
각 책의 제목과 저자명, 그리고 200자 이내의 추천 이유를 함께 알려주세요.

응답 형식:
제목: [정확한 책 제목]
저자: [정확한 저자 이름]
추천 이유: [200자 이내의 추천 이유]
---`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          '당신은 한국의 전문 독서 모임 큐레이터입니다. 한국에서 실제로 출간된 책들 중에서 독서 모임에 적합한 책을 추천해주세요. 가상의 책이나 존재하지 않는 책을 추천하지 마세요. 제목과 저자명을 정확하게 제공하는 것이 매우 중요합니다. 각 책의 추천 이유는 200자를 넘지 않도록 해주세요.',
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
