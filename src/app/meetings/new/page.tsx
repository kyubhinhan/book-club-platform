'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import MeetingCreation from '@/components/MeetingCreation';
import { Book } from '@prisma/client';

interface Discussion {
  id: string;
  questions: string[];
  bookId: string;
  book: Book;
}

export default function NewMeetingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const discussionId = searchParams.get('discussionId');
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!discussionId) {
      router.push('/books');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch discussion data with included book data
        const discussionResponse = await fetch(
          `/api/discussions/${discussionId}`
        );
        if (!discussionResponse.ok) {
          throw new Error('Failed to fetch discussion data');
        }
        const discussionData = await discussionResponse.json();
        setDiscussion(discussionData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(
          error instanceof Error
            ? error.message
            : '데이터를 가져오는데 실패했습니다.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [discussionId, router]);

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

  if (!discussion) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <MeetingCreation
        book={discussion.book}
        discussionQuestions={discussion.questions}
        discussionId={discussion.id}
      />
    </main>
  );
}
