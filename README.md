# 독서 모임 플랫폼

AI 기반의 독서 모임 운영 플랫폼입니다. 도서 추천부터 발제문 생성, 모임 일정 관리까지 독서 모임 운영에 필요한 다양한 기능을 제공합니다.

## 주요 기능

- 🤖 AI 기반 도서 추천
- 📝 발제문 자동 생성
- 📅 모임 일정 관리 및 투표
- 📚 자료 공유 게시판

## 기술 스택

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Next.js API Routes
- Database: PostgreSQL with Prisma ORM
- AI: OpenAI API

## 시작하기

1. 저장소 클론

```bash
git clone https://github.com/[username]/book-club-platform.git
cd book-club-platform
```

2. 의존성 설치

```bash
npm install
```

3. 환경 변수 설정
   `.env` 파일을 생성하고 다음 변수들을 설정합니다:

```
DATABASE_URL="postgresql://..."
OPENAI_API_KEY="your-api-key"
```

4. 데이터베이스 마이그레이션

```bash
npx prisma migrate dev
```

5. 개발 서버 실행

```bash
npm run dev
```

## 환경 변수

- `DATABASE_URL`: PostgreSQL 데이터베이스 연결 URL
- `OPENAI_API_KEY`: OpenAI API 키

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스

MIT License
