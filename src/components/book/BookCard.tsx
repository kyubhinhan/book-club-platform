'use client';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Book } from '@/types/book';

interface BookCardProps {
  book: Book;
  showRecommendationReason?: boolean; // 추천 이유 표시 여부
}

export default function BookCard({
  book,
  showRecommendationReason = true,
}: BookCardProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongDescription = (book.description?.length ?? 0) > 150;
  const displayDescription =
    showRecommendationReason && isLongDescription && !isExpanded
      ? `${book.description?.slice(0, 150)}...`
      : book.description;

  const handleGenerateMeeting = async () => {
    try {
      // book이 네이버 API에서 온 것인지 확인 (id가 naver_로 시작하는지)
      if (book.id.startsWith('naver_')) {
        // 네이버 API에서 온 책이면 DB에 저장
        const response = await fetch('/api/books', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(book),
        });

        if (response.ok) {
          const result = await response.json();
          // 저장된 책의 ID로 업데이트
          book.id = result.book.id;
        }
      }

      router.push(`/meetings/new?bookId=${book.id}`);
    } catch (error) {
      console.error('Error saving book:', error);
      // 에러가 발생해도 모임 생성 페이지로 이동
      router.push(`/meetings/new?bookId=${book.id}`);
    }
  };

  return (
    <div className="flex gap-8 p-6 border-gray-200 border rounded-xl hover:shadow-lg transition-shadow bg-white h-[520px] overflow-hidden">
      {/* 책 이미지 */}
      <div className="w-1/3 flex-shrink-0">
        <Image
          src={book.imageUrl ?? '/images/default-book-cover.jpg'}
          alt={book.title}
          width={240}
          height={320}
          className="w-full h-full object-cover rounded-lg shadow-md"
        />
      </div>

      {/* 책 정보 */}
      <div className="w-2/3 flex flex-col h-full overflow-hidden">
        {/* 제목과 저자 정보 */}
        <div className="mb-4 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 truncate">
            {book.title}
          </h2>
          <p className="text-lg text-gray-600 mt-2 truncate">
            저자: {book.author}
          </p>
          {book.link && (
            <a
              href={book.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1 text-primary-600 hover:underline text-sm font-medium"
            >
              상세 정보 보기 ↗
            </a>
          )}
        </div>

        {/* 스크롤 가능한 설명 영역 */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-y-auto pr-4">
            <div className="relative">
              <p className="text-gray-700 leading-relaxed">
                {displayDescription}
              </p>
              {showRecommendationReason && isLongDescription && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-primary-600 hover:text-primary-800 mt-2 text-sm font-medium cursor-pointer hover:underline"
                >
                  {isExpanded ? '접기' : '펼치기'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 고정된 하단 영역 */}
        <div className="mt-4 space-y-4 flex-shrink-0">
          {showRecommendationReason && book.recommendationReason && (
            <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
              <h3 className="font-semibold mb-2 text-primary-900">
                📚 추천 이유
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {book.recommendationReason}
              </p>
            </div>
          )}

          <button
            onClick={handleGenerateMeeting}
            className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <span> 🚀 모임 만들기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
