# 독서 모임 플랫폼

AI 기반의 독서 모임 운영 플랫폼입니다. 도서 추천부터 발제문 생성, 모임 일정 관리까지 독서 모임 운영에 필요한 다양한 기능을 제공합니다.

## 주요 기능

- 🔐 이메일 및 카카오 로그인
- 🤖 AI 기반 도서 추천
- 📝 발제문 자동 생성
- 📅 모임 일정 관리 및 투표
- 📚 자료 공유 게시판

## 기술 스택

- Frontend: Next.js, React, TypeScript, Tailwind CSS, Material-UI
- Backend: Next.js API Routes
- Database: PostgreSQL with Prisma ORM
- Authentication: NextAuth.js
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

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
DIRECT_URL="postgresql://username:password@localhost:5432/database_name"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"

# Kakao OAuth
KAKAO_CLIENT_ID="your-kakao-client-id"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
```

4. 데이터베이스 마이그레이션

```bash
npx prisma migrate dev
```

5. 개발 서버 실행

```bash
npm run dev
```

## 카카오 로그인 설정

1. [Kakao Developers](https://developers.kakao.com/)에서 애플리케이션 생성
2. 플랫폼 > Web 플랫폼 등록
   - 사이트 도메인: `http://localhost:3000`
3. 카카오 로그인 활성화
   - Redirect URI: `http://localhost:3000/api/auth/callback/kakao`
4. 앱 키에서 REST API 키와 Client Secret을 복사하여 환경 변수에 설정

## 환경 변수

### 필수

- `DATABASE_URL`: PostgreSQL 데이터베이스 연결 URL
- `NEXTAUTH_URL`: 애플리케이션 URL (개발: http://localhost:3000)
- `NEXTAUTH_SECRET`: NextAuth.js 시크릿 키 (랜덤 문자열)
- `KAKAO_CLIENT_ID`: 카카오 OAuth 클라이언트 ID
- `KAKAO_CLIENT_SECRET`: 카카오 OAuth 클라이언트 시크릿
- `OPENAI_API_KEY`: OpenAI API 키

### 선택

- `CLOUDINARY_CLOUD_NAME`: Cloudinary 클라우드 이름
- `CLOUDINARY_API_KEY`: Cloudinary API 키
- `CLOUDINARY_API_SECRET`: Cloudinary API 시크릿

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스

MIT License
