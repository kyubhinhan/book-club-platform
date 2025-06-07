'use client';

import { useState, useEffect, Fragment } from 'react';
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  Transition,
} from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { BookRecommendationManager } from '@/utils/book';
import type { BookWithSummary } from './BookCard';
import BookCard from './BookCard';
import LoadingBookCard from './LoadingBookCard';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';

interface Category {
  id: string;
  name: string;
  emoji: string;
}

interface RecommendationFormData {
  category: Category;
}

const categories: Category[] = [
  { id: 'fiction', name: '소설', emoji: '📚' },
  { id: 'non-fiction', name: '비소설', emoji: '📖' },
  { id: 'self-help', name: '자기계발', emoji: '✨' },
  { id: 'business', name: '경영/경제', emoji: '💼' },
];

export default function BookRecommendation() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [recommendedBooks, setRecommendedBooks] = useState<BookWithSummary[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);

  const { handleSubmit, setValue, watch } = useForm<RecommendationFormData>({
    defaultValues: {
      category: categories[0],
    },
  });

  const selectedCategory = watch('category');

  // 컴포넌트 마운트 시 이전 상태 복원
  useEffect(() => {
    const shouldRestoreState = searchParams.get('restoreState') === 'true';

    // 상태 복원이 요청되었을 때만 이전 상태 복원
    if (shouldRestoreState) {
      const savedBookIds = BookRecommendationManager.getState();
      if (savedBookIds.length > 0) {
        fetchBooksByIds(savedBookIds);
      }
    }
  }, [searchParams]);

  const fetchBooksByIds = async (bookIds: string[]) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/books/getByIds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: bookIds }),
      });

      if (!response.ok) throw new Error('책 정보 조회에 실패했습니다.');

      const data = await response.json();
      setRecommendedBooks(data.books);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async () => {
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
      });

      if (!response.ok) throw new Error('책 추천에 실패했습니다.');

      const data = await response.json();
      const books: BookWithSummary[] = data.books;
      setRecommendedBooks(books);

      // 추천 결과 저장
      BookRecommendationManager.saveState(books.map((book) => book.id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">AI 도서 추천</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
        <div className="flex gap-4">
          <div className="flex-1">
            <Listbox
              value={selectedCategory}
              onChange={(category) => setValue('category', category)}
            >
              <div className="relative">
                <ListboxButton className="relative w-full cursor-pointer rounded-lg bg-white py-3 pl-4 pr-10 text-left border focus:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-300">
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
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <ListboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {categories.map((category) => (
                      <ListboxOption
                        key={category.id}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                            active
                              ? 'bg-primary-100 text-primary-900'
                              : 'text-gray-900'
                          }`
                        }
                        value={category}
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={`block truncate ${
                                selected ? 'font-medium' : 'font-normal'
                              }`}
                            >
                              <span className="mr-2">{category.emoji}</span>
                              {category.name}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600">
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
                </Transition>
              </div>
            </Listbox>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-300 cursor-pointer"
          >
            {loading ? '추천 중...' : '추천 받기'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <LoadingBookCard key={i} />
          ))}
        </div>
      )}

      {!loading && recommendedBooks.length > 0 && (
        <div className="space-y-6">
          {recommendedBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              currentBooks={recommendedBooks}
            />
          ))}
        </div>
      )}
    </div>
  );
}
