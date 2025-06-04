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
  const isLongDescription = book.description.length > 150;
  const displayDescription =
    isLongDescription && !isExpanded
      ? `${book.description.slice(0, 150)}...`
      : book.description;

  return (
    <div className="flex gap-8 p-6 border rounded-xl hover:shadow-lg transition-shadow bg-white h-[500px] overflow-hidden">
      {/* 책 이미지 */}
      <div className="w-1/3 flex-shrink-0">
        <Image
          src={book.imageUrl || '/images/book-placeholder.svg'}
          alt={`${book.title} 표지`}
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
                  className="text-blue-600 hover:text-blue-800 mt-2 text-sm font-medium cursor-pointer hover:underline"
                >
                  {isExpanded ? '접기' : '펼치기'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 고정된 하단 영역 */}
        <div className="mt-4 space-y-4 flex-shrink-0">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="font-semibold mb-2 text-blue-900">📚 추천 이유</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {book.summary}
            </p>
          </div>

          <button
            onClick={() => router.push(`/discussions/new?bookId=${book.id}`)}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>✍️ 발제문 생성하기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
