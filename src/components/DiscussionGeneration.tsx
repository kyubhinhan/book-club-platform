'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

interface Discussion {
  questions: string[];
  bookId: string;
}

interface QuestionFormData {
  question: string;
}

export default function DiscussionGeneration() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookId');

  const [loading, setLoading] = useState(false);
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<QuestionFormData>({
    defaultValues: {
      question: '',
    },
  });

  // Computed property for create meeting button state
  const isCreateMeetingDisabled = !discussion?.questions.length;
  const createMeetingButtonClassName = `w-full px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center ${
    isCreateMeetingDisabled
      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
      : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 cursor-pointer'
  }`;

  const onSubmit = (data: QuestionFormData) => {
    if (!discussion) return;

    setDiscussion({
      ...discussion,
      questions: [...discussion.questions, data.question.trim()],
    });
    reset();
  };

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
      cancelled = true;
    };
  }, [bookId]);

  const handleCreateMeeting = async () => {
    if (!discussion) return;

    try {
      // Create discussion in the database
      const response = await fetch('/api/discussions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions: discussion.questions,
          bookId: discussion.bookId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create discussion');
      }

      const createdDiscussion = await response.json();

      // Navigate with only discussionId in URL
      router.push(`/meetings/new?discussionId=${createdDiscussion.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      );
    }
  };

  const handleDeleteQuestion = (index: number) => {
    if (!discussion) return;

    setDiscussion({
      ...discussion,
      questions: discussion.questions.filter((_, i) => i !== index),
    });
  };

  if (!bookId) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="p-3 bg-red-100 text-red-700 rounded-lg">
          도서를 먼저 선택해주세요.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button
        onClick={() => {
          router.push('/?restoreState=true');
        }}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
      >
        <svg
          className="w-5 h-5 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        도서 추천 받기
      </button>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-700 mb-2">
          AI 발제문 생성
        </h1>
        <p className="text-base text-gray-600">
          AI가 선택하신 도서에 대한 발제 질문을 생성합니다.
        </p>
      </div>

      {loading && (
        <div className="p-3 mb-4 bg-primary-50 text-primary-700 rounded-lg">
          <div className="flex items-center justify-center text-base">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
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
        <div className="p-3 mb-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {discussion && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-primary-100 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-primary-800 mb-3 flex items-center">
              <span className="mr-2">💡</span>
              발제 질문
            </h2>

            {/* 질문 추가 입력 필드 */}
            <form onSubmit={handleSubmit(onSubmit)} className="mb-4 flex gap-2">
              <input
                type="text"
                {...register('question', {
                  required: true,
                  minLength: 5,
                })}
                placeholder="새로운 발제 질문을 입력하세요"
                className="flex-1 p-3 text-base border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                disabled={!isValid}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  !isValid
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700 cursor-pointer'
                } text-base`}
              >
                추가
              </button>
            </form>

            <ul className="space-y-3">
              {discussion.questions.map((question, index) => (
                <li
                  key={index}
                  className="flex items-center p-4 bg-primary-50 rounded-lg group"
                >
                  <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-primary-600 text-white rounded-full mr-3 text-base">
                    {index + 1}
                  </span>
                  <p className="text-gray-800 text-base leading-relaxed flex-1">
                    {question}
                  </p>
                  <button
                    onClick={() => handleDeleteQuestion(index)}
                    className="opacity-0 group-hover:opacity-100 ml-2 text-red-500 hover:text-red-700 transition-opacity cursor-pointer"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleCreateMeeting}
            disabled={isCreateMeetingDisabled}
            className={createMeetingButtonClassName}
          >
            <span className="mr-2">📅</span>
            모임 일정 만들기
          </button>
        </div>
      )}
    </div>
  );
}
