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
    isbn: bigint;
    imageUrl: string;
    publisher: string;
    price: number;
    pubDate: Date;
  };
}

export async function searchBookByTitleAndAuthor(
  title: string,
  author: string
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

    // 정확도를 높이기 위해 제목과 저자가 정확히 일치하는 도서 찾기
    const exactMatch = data.items.find((item) => {
      const cleanItemTitle = item.title.replace(/<[^>]*>?/g, '').toLowerCase();
      const cleanItemAuthor = item.author
        .replace(/<[^>]*>?/g, '')
        .toLowerCase();
      const cleanSearchTitle = title.toLowerCase();
      const cleanSearchAuthor = author.toLowerCase();

      return (
        cleanItemTitle.includes(cleanSearchTitle) &&
        cleanItemAuthor.includes(cleanSearchAuthor)
      );
    });

    const bookInfo = exactMatch;
    if (!bookInfo) {
      return {
        success: false,
        error: '해당하는 도서를 찾을 수 없습니다.',
      };
    }

    // HTML 태그 제거 및 특수문자 처리
    const cleanTitle = bookInfo.title.replace(/<[^>]*>?/g, '');
    const cleanDescription = bookInfo.description.replace(/<[^>]*>?/g, '');
    const cleanAuthor = bookInfo.author.replace(/<[^>]*>?/g, '');

    // 가격 정보 처리: price가 있으면 price 사용, 없으면 discount 사용
    const priceStr = bookInfo.price || bookInfo.discount || '0';
    const price = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);

    return {
      success: true,
      book: {
        title: cleanTitle,
        author: cleanAuthor,
        description: cleanDescription,
        isbn: BigInt(bookInfo.isbn.replace(/[^0-9]/g, '')),
        imageUrl: bookInfo.image,
        publisher: bookInfo.publisher,
        price,
        pubDate: new Date(
          bookInfo.pubdate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')
        ),
      },
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

export async function searchBookByISBN(
  isbn: string | number | bigint
): Promise<BookSearchResult> {
  try {
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('네이버 API 키가 설정되지 않았습니다.');
    }

    // ISBN을 정수로 변환 (네이버 API 요구사항)
    const numericISBN =
      typeof isbn === 'string'
        ? parseInt(isbn.replace(/[^0-9]/g, ''), 10)
        : Number(isbn);

    const url = new URL('https://openapi.naver.com/v1/search/book_adv.json');
    url.searchParams.append('d_isbn', numericISBN.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!response.ok) {
      throw new Error('API 요청에 실패했습니다.');
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return {
        success: false,
        error: '해당 ISBN으로 검색된 도서가 없습니다.',
      };
    }

    const bookInfo: NaverBookInfo = data.items[0];

    // HTML 태그 제거 및 특수문자 처리
    const cleanTitle = bookInfo.title.replace(/<[^>]*>?/g, '');
    const cleanDescription = bookInfo.description.replace(/<[^>]*>?/g, '');
    const cleanAuthor = bookInfo.author.replace(/<[^>]*>?/g, '');

    // 가격 정보 처리: price가 있으면 price 사용, 없으면 discount 사용
    const priceStr = bookInfo.price || bookInfo.discount || '0';
    const price = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);

    return {
      success: true,
      book: {
        title: cleanTitle,
        author: cleanAuthor,
        description: cleanDescription,
        isbn: BigInt(bookInfo.isbn.replace(/[^0-9]/g, '')),
        imageUrl: bookInfo.image,
        publisher: bookInfo.publisher,
        price,
        pubDate: new Date(
          bookInfo.pubdate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')
        ),
      },
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
