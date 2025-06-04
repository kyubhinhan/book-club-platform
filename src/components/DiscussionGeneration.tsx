'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Discussion {
  questions: string[];
  bookId: string;
}

export default function DiscussionGeneration() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookId');

  const [loading, setLoading] = useState(false);
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookId) return;

    let cancelled = false;

    const fetchDiscussion = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/discussions/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId }),
        });

        if (!response.ok) throw new Error('발제문 생성에 실패했습니다.');

        const data = await response.json();
        if (!cancelled) setDiscussion(data.discussion);
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error
              ? err.message
              : '알 수 없는 오류가 발생했습니다.'
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDiscussion();

    return () => {
      cancelled = true; // cleanup to prevent memory leaks
    };
  }, [bookId]);

  const handleCreateMeeting = async () => {
    if (!discussion) return;

    try {
      // 모임 생성 페이지로 이동하면서 발제문 데이터를 state로 전달
      router.push(
        `/meetings/new?bookId=${discussion.bookId}&discussion=${encodeURIComponent(
          JSON.stringify({
            questions: discussion.questions,
          })
        )}`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      );
    }
  };

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
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-indigo-700 mb-2">
          AI 발제문 생성
        </h1>
        <p className="text-gray-600">
          AI가 선택하신 도서에 대한 발제 질문을 생성합니다.
        </p>
      </div>

      {loading && (
        <div className="p-4 mb-6 bg-blue-100 text-blue-700 rounded-lg">
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            발제문을 생성하고 있습니다...
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {discussion && (
        <div className="space-y-6">
          <div className="p-8 bg-white border-2 border-indigo-100 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold text-indigo-800 mb-6 flex items-center">
              <span className="mr-2">💡</span>
              발제 질문
            </h2>
            <ul className="space-y-4">
              {discussion.questions.map((question, index) => (
                <li
                  key={index}
                  className="flex items-start p-4 bg-indigo-50 rounded-lg"
                >
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-full mr-4">
                    {index + 1}
                  </span>
                  <p className="text-gray-800 text-lg leading-relaxed pt-1">
                    {question}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleCreateMeeting}
            className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-lg font-semibold rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
          >
            <span className="mr-2">📅</span>
            모임 일정 만들기
          </button>
        </div>
      )}
    </div>
  );
}
