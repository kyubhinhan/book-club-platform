# Book Club Platform

독서 모임을 위한 웹 플랫폼입니다.

## 기능

- 모임 생성 및 관리
- 도서 정보 관리
- 첨부파일 업로드/다운로드
- PDF 다운로드 (Puppeteer 사용)

## 설치

```bash
npm install
```

## 환경변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```bash
# Database
DATABASE_URL="your-database-url"
DIRECT_URL="your-direct-database-url"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"
```

## PDF 생성 기능

PDF 다운로드 기능을 사용하려면 Puppeteer가 필요합니다:

```bash
npm install puppeteer
```

### Vercel 배포 시

Vercel에서 PDF 생성 기능을 사용하려면:

1. **vercel.json** 파일이 이미 설정되어 있습니다
2. **환경변수**에서 `NEXTAUTH_URL`을 프로덕션 URL로 설정하세요

## 실행

```bash
npm run dev
```

## 배포

```bash
npm run build
npm start
```
