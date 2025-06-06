import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface BookWithSummary {
  id: string;
  title: string;
  author: string;
  description: string;
  summary: string;
  imageUrl?: string;
}

export default function BookCard({ book }: { book: BookWithSummary }) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 150;
  const isLongDescription = book.description
    ? book.description.length > maxLength
    : false;
  const displayDescription =
    isLongDescription && !isExpanded
      ? `${book.description?.slice(0, maxLength)}...`
      : book.description;

  return (
    <div className="flex bg-white p-6 rounded-xl shadow-sm border border-primary-100">
      {/* 책 표지 이미지 */}
      <div className="w-1/3 mr-6">
        <div className="aspect-[3/4] bg-primary-50 rounded-lg overflow-hidden">
          {book.imageUrl ? (
            <Image
              src={book.imageUrl}
              alt={book.title}
              width={300}
              height={400}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary-300">
              <span className="text-6xl">📚</span>
            </div>
          )}
        </div>
      </div>

      <div className="w-2/3 flex flex-col h-full overflow-hidden">
        {/* 제목과 저자 정보 */}
        <div className="mb-4 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 truncate">
            {book.title}
          </h2>
          <p className="text-lg text-gray-600 mt-2 truncate">
            저자: {book.author}
          </p>
        </div>

        {/* 스크롤 가능한 설명 영역 */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-y-auto pr-4">
            <div className="relative">
              <p className="text-gray-700 leading-relaxed">
                {displayDescription}
              </p>
              {isLongDescription && (
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
          <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
            <h3 className="font-semibold mb-2 text-primary-900">
              📚 추천 이유
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {book.summary}
            </p>
          </div>

          <button
            onClick={() => router.push(`/discussions/new?bookId=${book.id}`)}
            className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>✍️ 발제문 생성하기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
