'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { Book } from '@prisma/client';

interface MeetingCreationProps {
  book: Book;
  discussionQuestions: string[];
  discussionId: string;
}

interface MeetingFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  meetingType: 'online' | 'offline';
  location?: string;
  meetingDay: string;
  meetingTime: string;
  meetingFrequency: string;
}

export default function MeetingCreation({
  book,
  discussionQuestions,
  discussionId,
}: MeetingCreationProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MeetingFormData>();

  const onSubmit = async (data: MeetingFormData) => {
    try {
      const response = await fetch('/api/meetings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          bookId: book.id,
          discussionId: discussionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create meeting');
      }

      const result = await response.json();
      router.push(`/meetings/${result.id}`);
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 왼쪽: 책 정보와 발제문 */}
        <div className="space-y-6">
          {/* 책 정보 카드 */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="relative w-full h-[300px] mb-4">
              <Image
                src={book.imageUrl || '/default-book-cover.jpg'}
                alt={book.title}
                fill
                className="object-contain rounded-lg"
              />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {book.title}
            </h2>
            <p className="text-gray-600 mt-2">{book.author}</p>
            <p className="text-gray-700 mt-4 text-sm leading-relaxed">
              {book.description}
            </p>
          </div>

          {/* 발제문 섹션 */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">💡</span>
              발제문
            </h2>
            <div className="space-y-3">
              {discussionQuestions.map((question, index) => (
                <div
                  key={index}
                  className="p-4 bg-primary-50 rounded-lg text-gray-800 text-base leading-relaxed"
                >
                  <span className="inline-flex items-center justify-center bg-primary-600 text-white rounded-full w-6 h-6 text-sm mr-3">
                    {index + 1}
                  </span>
                  {question}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 오른쪽: 모임 생성 폼 */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">모임 만들기</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                모임 제목
              </label>
              <input
                type="text"
                {...register('title', { required: '모임 제목은 필수입니다' })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="모임의 제목을 입력해주세요"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                모임 소개
              </label>
              <textarea
                {...register('description', { required: true })}
                rows={5}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="모임에 대해 소개해주세요"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시작일
                </label>
                <input
                  type="date"
                  {...register('startDate', { required: true })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  종료일
                </label>
                <input
                  type="date"
                  {...register('endDate', { required: true })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                모임 정원
              </label>
              <input
                type="number"
                {...register('maxParticipants', {
                  required: true,
                  min: 2,
                  max: 20,
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                min={2}
                max={20}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                모임 방식
              </label>
              <select
                {...register('meetingType', { required: true })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="online">온라인</option>
                <option value="offline">오프라인</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                모임 요일
              </label>
              <select
                {...register('meetingDay', { required: true })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="monday">월요일</option>
                <option value="tuesday">화요일</option>
                <option value="wednesday">수요일</option>
                <option value="thursday">목요일</option>
                <option value="friday">금요일</option>
                <option value="saturday">토요일</option>
                <option value="sunday">일요일</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                모임 시간
              </label>
              <input
                type="time"
                {...register('meetingTime', { required: true })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                모임 주기
              </label>
              <select
                {...register('meetingFrequency', { required: true })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="weekly">매주</option>
                <option value="biweekly">격주</option>
                <option value="monthly">매월</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center text-base font-semibold"
            >
              <span className="mr-2">📅</span>
              모임 만들기
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
