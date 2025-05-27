import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface Discussion {
  id: string;
  content: string;
  questions: string[];
  bookId: string;
  meetingId: string;
}

export default function DiscussionGeneration() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookId');

  const [loading, setLoading] = useState(false);
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateDiscussion = async () => {
    if (!bookId) {
      setError('도서 ID가 필요합니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/discussions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookId }),
      });

      if (!response.ok) {
        throw new Error('발제문 생성에 실패했습니다.');
      }

      const data = await response.json();
      setDiscussion(data.discussion);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookId) {
      generateDiscussion();
    }
  }, [bookId]);

  if (!bookId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          도서를 먼저 선택해주세요.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">AI 발제문 생성</h1>

      {loading && (
        <div className="p-4 mb-6 bg-blue-100 text-blue-700 rounded-lg">
          발제문을 생성하고 있습니다...
        </div>
      )}

      {error && (
        <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {discussion && (
        <div className="space-y-6">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">발제 질문</h2>
            <ul className="list-decimal list-inside space-y-3">
              {discussion.questions.map((question, index) => (
                <li key={index} className="text-gray-700">
                  {question}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">전체 발제문</h2>
            <div className="prose max-w-none">
              {discussion.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <button
            onClick={() => window.location.href = '/meetings/new'}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            모임 일정 만들기
          </button>
        </div>
      )}
    </div>
  );
} 