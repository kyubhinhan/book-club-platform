'use client';

import { useState } from 'react';
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import BookCard from './BookCard';
import type { BookWithSummary } from './BookCard';
import LoadingBookCard from './LoadingBookCard';

const categories = [
  {
    id: 'literature',
    name: '문학',
    emoji: '📚',
  },
  {
    id: 'philosophy',
    name: '철학',
    emoji: '🤔',
  },
  {
    id: 'history',
    name: '역사',
    emoji: '📜',
  },
  {
    id: 'science',
    name: '과학',
    emoji: '🔬',
  },
  {
    id: 'self-development',
    name: '자기계발',
    emoji: '✨',
  },
  {
    id: 'social-science',
    name: '사회과학',
    emoji: '🌏',
  },
];

export default function BookRecommendation() {
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<BookWithSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/books/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory.id,
          count: 5,
        }),
      } as RequestInit);

      if (!response.ok) {
        throw new Error('도서 추천을 가져오는데 실패했습니다.');
      }

      const data = await response.json();
      setBooks(data.books);
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">AI 도서 추천</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <div className="flex-1">
            <Listbox value={selectedCategory} onChange={setSelectedCategory}>
              <div className="relative mt-1">
                <ListboxButton
                  className={`
                  relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 cursor-pointer
                  text-left border border-gray-300 focus:outline-none 
                  focus-visible:border-blue-500 focus-visible:ring-2 
                  focus-visible:ring-white/75 focus-visible:ring-offset-2 
                  focus-visible:ring-offset-blue-300
                `}
                >
                  <span className="block truncate text-gray-900">
                    <span className="mr-2">{selectedCategory.emoji}</span>
                    {selectedCategory.name}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </span>
                </ListboxButton>
                <ListboxOptions
                  className={`
                  absolute mt-1 max-h-60 w-full overflow-auto rounded-md 
                  bg-white py-1 text-base shadow-lg ring-1 ring-black/5 
                  focus:outline-none z-10
                `}
                >
                  {categories.map((category) => (
                    <ListboxOption
                      key={category.id}
                      className={({ active }) => `
                        relative cursor-default select-none py-2 pl-10 pr-4
                        ${
                          active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                        }
                      `}
                      value={category}
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`
                            block truncate 
                            ${selected ? 'font-medium' : 'font-normal'}
                          `}
                          >
                            <span className="mr-2">{category.emoji}</span>
                            {category.name}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </div>
            </Listbox>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`
              px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer
              hover:bg-blue-700 disabled:bg-blue-300
            `}
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

      {loading && (
        <div className="space-y-6">
          {[...Array(5)].map((_, index) => (
            <LoadingBookCard key={index} />
          ))}
        </div>
      )}

      {!loading && books.length > 0 && (
        <div className="space-y-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
