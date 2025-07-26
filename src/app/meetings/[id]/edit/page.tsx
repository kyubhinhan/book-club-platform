'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import MeetingEditAndCreation from '@/components/MeetingEditAndCreation';
import { Book } from '@prisma/client';

export default function EditMeetingPage() {
  const router = useRouter();
  const params = useParams();
  const meetingId = params?.id as string;
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (meetingId) {
      const fetchMeetingAndBook = async () => {
        try {
          // 먼저 모임 정보를 가져와서 책 ID를 확인
          const meetingResponse = await fetch(`/api/meetings/${meetingId}`);
          if (!meetingResponse.ok) {
            throw new Error('Failed to fetch meeting data');
          }
          const meetingData = await meetingResponse.json();
          const bookId = meetingData.meeting.bookId;

          // 책 정보 가져오기
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
              : '모임 정보를 가져오는데 실패했습니다.'
          );
        } finally {
          setLoading(false);
        }
      };
      fetchMeetingAndBook();
    } else {
      router.push('/meetings');
    }
  }, [meetingId, router]);

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
        <MeetingEditAndCreation book={book} meetingId={meetingId} />
      </div>
    );
  }

  return null;
}
