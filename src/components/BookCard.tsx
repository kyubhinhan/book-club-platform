import Image from 'next/image';

export interface BookWithSummary {
  id: string;
  title: string;
  author: string;
  description: string;
  summary: string;
  imageUrl?: string;
}

export default function BookCard({ book }: { book: BookWithSummary }) {
  return (
    <div className="flex gap-6 p-6 border rounded-lg hover:shadow-lg transition-shadow">
      {/* 책 이미지 */}
      <Image
        src={book.imageUrl || '/images/book-placeholder.svg'}
        alt={`${book.title} 표지`}
        width={192}
        height={256}
        className="flex-shrink-0 object-cover rounded-lg shadow-md"
      />

      {/* 책 정보 */}
      <div className="flex-1">
        <h2 className="text-xl font-semibold mb-2 text-gray-900">
          {book.title}
        </h2>
        <p className="text-gray-600 mb-2">저자: {book.author}</p>
        <p className="text-gray-700 mb-4">{book.description}</p>
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-medium mb-2 text-gray-900">추천 이유</h3>
          <p className="text-gray-700">{book.summary}</p>
        </div>
        <button
          onClick={() =>
            (window.location.href = `/discussions/new?bookId=${book.id}`)
          }
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          발제문 생성하기
        </button>
      </div>
    </div>
  );
}
