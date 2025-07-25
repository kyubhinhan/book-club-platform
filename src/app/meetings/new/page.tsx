'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import MeetingCreation from '@/components/MeetingCreation';
import { Book } from '@prisma/client';

export default function NewMeetingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams?.get('bookId');
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookId) {
      const fetchBook = async () => {
        try {
          const bookResponse = await fetch(`/api/books/${bookId}`);
          if (!bookResponse.ok) {
            throw new Error('Failed to fetch book data');
          }
          const bookData = await bookResponse.json();
          setBook(bookData);
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : '책 정보를 가져오는데 실패했습니다.'
          );
        } finally {
          setLoading(false);
        }
      };
      fetchBook();
    } else {
      router.push('/books');
    }
  }, [bookId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">모임 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
        </div>
      </div>
    );
  }

  if (book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MeetingCreation book={book} />
      </div>
    );
  }

  return null;
}
