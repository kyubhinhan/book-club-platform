"use client";

import { useState } from 'react';

const categories = [
  { id: 'literature', name: '문학' },
  { id: 'philosophy', name: '철학' },
  { id: 'history', name: '역사' },
  { id: 'science', name: '과학' },
  { id: 'self-development', name: '자기계발' },
  { id: 'social-science', name: '사회과학' },
];

interface BookWithSummary {
  id: string;
  title: string;
  author: string;
  description: string;
  summary: string;
}

export default function BookRecommendation() {
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<BookWithSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const category = formData.get('category') as string;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/books/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, count: 5 }),
      });

      if (!response.ok) {
        throw new Error('도서 추천을 가져오는데 실패했습니다.');
      }

      const data = await response.json();
      setBooks(data.books);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">AI 도서 추천</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <select
            name="category"
            className="flex-1 p-2 border rounded-lg"
            required
          >
            <option value="">카테고리 선택</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? '추천 중...' : '추천 받기'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {books.length > 0 && (
        <div className="space-y-6">
          {books.map((book) => (
            <div
              key={book.id}
              className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{book.title}</h2>
              <p className="text-gray-600 mb-2">저자: {book.author}</p>
              <p className="text-gray-700 mb-4">{book.description}</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">추천 이유</h3>
                <p className="text-gray-700">{book.summary}</p>
              </div>
              <button
                onClick={() => window.location.href = `/discussions/new?bookId=${book.id}`}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                발제문 생성하기
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 