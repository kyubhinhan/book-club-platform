import { Book } from '@/types/book';

interface NaverBookSearchResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverBookInfo[];
}

interface NaverBookInfo {
  title: string; // 책 제목
  link: string; // 네이버 도서 정보 URL
  image: string; // 섬네일 이미지 URL
  author: string; // 저자 이름
  price: string; // 정가
  discount: string; // 판매가
  publisher: string; // 출판사
  pubdate: string; // 출간일
  isbn: string; // ISBN
  description: string; // 책 소개
}

interface BookSearchResult {
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

// 네이버 API 응답을 Book 타입으로 변환하는 공통 함수
function convertNaverBookToBook(item: NaverBookInfo): Book {
  const baseBook = convertNaverBookToBookSearchResult(item);

  return {
    id: `naver_${item.isbn.replace(/[^0-9]/g, '')}`,
    title: baseBook.title,
    author: baseBook.author,
    description: baseBook.description,
    isbn: baseBook.isbn,
    category: '',
    imageUrl: baseBook.imageUrl,
    link: baseBook.link,
    publisher: baseBook.publisher,
    price: baseBook.price,
    pubDate: baseBook.pubDate.toISOString(),
    recommendationReason: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// 네이버 API 응답을 BookSearchResult 타입으로 변환하는 공통 함수
function convertNaverBookToBookSearchResult(item: NaverBookInfo): {
  title: string;
  author: string;
  description: string;
  isbn: string;
  imageUrl: string;
  link: string;
  publisher: string;
  price: number;
  pubDate: Date;
} {
  // HTML 태그 제거 및 특수문자 처리
  const cleanTitle = item.title.replace(/<[^>]*>?/g, '');
  const cleanDescription = item.description.replace(/<[^>]*>?/g, '');
  const cleanAuthor = item.author.replace(/<[^>]*>?/g, '').replace(/\^/g, ' ');

  // 가격 정보 처리: price가 있으면 price 사용, 없으면 discount 사용
  const priceStr = item.price || item.discount || '0';
  const price = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);

  return {
    title: cleanTitle,
    author: cleanAuthor,
    description: cleanDescription,
    isbn: item.isbn.replace(/[^0-9]/g, ''),
    imageUrl: item.image,
    link: item.link,
    publisher: item.publisher,
    price,
    pubDate: new Date(
      item.pubdate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')
    ),
  };
}

export async function searchBookByTitle(
  title: string
): Promise<BookSearchResult> {
  try {
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('네이버 API 키가 설정되지 않았습니다.');
    }

    const url = new URL('https://openapi.naver.com/v1/search/book_adv.json');
    // d_titl: 책 제목으로 검색
    url.searchParams.append('d_titl', title);
    url.searchParams.append('display', '10');

    const response = await fetch(url.toString(), {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!response.ok) {
      throw new Error('API 요청에 실패했습니다.');
    }

    const data: NaverBookSearchResponse = await response.json();

    if (!data.items || data.items.length === 0) {
      return {
        success: false,
        error: '해당하는 도서를 찾을 수 없습니다.',
      };
    }

    // 정확도를 높이기 위해 제목이 정확히 일치하는 도서 찾기
    const exactMatch = data.items.find((item) => {
      const cleanItemTitle = item.title.replace(/<[^>]*>?/g, '').toLowerCase();
      const cleanSearchTitle = title.toLowerCase();
      return cleanItemTitle.includes(cleanSearchTitle);
    });

    // 정확히 일치하는 도서가 없으면 첫 번째 도서 사용
    const bookInfo = exactMatch || data.items[0];
    if (!bookInfo) {
      return {
        success: false,
        error: '해당하는 도서를 찾을 수 없습니다.',
      };
    }

    return {
      success: true,
      book: convertNaverBookToBookSearchResult(bookInfo),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '도서 검색 중 오류가 발생했습니다.',
    };
  }
}

// 무한 스크롤을 위한 네이버 API 검색 함수
export async function searchBooksWithPagination(
  query: string,
  start: number = 1,
  display: number = 10
): Promise<{
  success: boolean;
  books: Book[];
  total: number;
  hasMore: boolean;
  error?: string;
}> {
  try {
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('네이버 API 키가 설정되지 않았습니다.');
    }

    const url = new URL('https://openapi.naver.com/v1/search/book.json');
    url.searchParams.append('query', query);
    url.searchParams.append('start', start.toString());
    url.searchParams.append('display', display.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!response.ok) {
      throw new Error('API 요청에 실패했습니다.');
    }

    const data: NaverBookSearchResponse = await response.json();

    if (!data.items || data.items.length === 0) {
      return {
        success: true,
        books: [],
        total: 0,
        hasMore: false,
      };
    }

    // 모든 결과를 Book 타입으로 변환
    const books = data.items.map(convertNaverBookToBook);

    return {
      success: true,
      books,
      total: data.total,
      hasMore: start + display <= data.total,
    };
  } catch (error) {
    return {
      success: false,
      books: [],
      total: 0,
      hasMore: false,
      error:
        error instanceof Error
          ? error.message
          : '도서 검색 중 오류가 발생했습니다.',
    };
  }
}
