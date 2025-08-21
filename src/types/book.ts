// 책 관련 공통 타입 정의

export type CategoryId = '소설' | '비소설' | '자기계발' | '경영/경제';

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  isbn: string | null;
  category: CategoryId;
  imageUrl: string | null;
  link: string | null;
  publisher: string | null;
  price: number | null;
  pubDate: string | null;
  recommendationReason: string | null;
  createdAt: string;
  updatedAt: string;
}

// API 응답에서 사용하는 타입
export interface BookApiResponse {
  success: boolean;
  error?: string;
  books?: Book[];
}

// 네이버 API 응답 타입
export interface NaverBookInfo {
  title: string;
  link: string;
  image: string;
  author: string;
  price: string;
  discount: string;
  publisher: string;
  pubdate: string;
  isbn: string;
  description: string;
}

export interface NaverBookSearchResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverBookInfo[];
}

// 네이버 API 검색 결과 타입
export interface BookSearchResult {
  success: boolean;
  error?: string;
  book?: {
    title: string;
    author: string;
    description: string;
    isbn: string;
    imageUrl: string;
    link: string;
    publisher: string;
    price: number;
    pubDate: Date;
  };
}
