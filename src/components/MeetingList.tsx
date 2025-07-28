'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { Meeting } from '@/types/meeting';
import Image from 'next/image';
import { Image as ImageIcon } from '@mui/icons-material';

export default function MeetingList() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchMyMeetings();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [session, status]);

  const fetchMyMeetings = async () => {
    try {
      const response = await fetch('/api/meetings/my');
      if (!response.ok) {
        throw new Error('내 모임 목록을 가져오는데 실패했습니다.');
      }

      const data = await response.json();
      setMeetings(data.meetings);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">로그인 정보를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">로그인이 필요합니다.</p>
        <a
          href="/auth/signin"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          로그인하기
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">내 모임 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          아직 만든 모임이 없습니다
        </h3>
        <p className="text-gray-600 mb-6">첫 번째 독서 모임을 만들어보세요!</p>
        <a
          href="/books"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          모임 만들기
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">내가 만든 모임</h2>
      </div>

      <div className="grid gap-4">
        {meetings.map((meeting) => (
          <a
            key={meeting.id}
            href={`/meetings/${meeting.id}`}
            className="block p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex gap-4 items-center">
              {/* 모임 이미지 */}
              <div className="flex-shrink-0 w-24 h-24 relative">
                {meeting.imageUrl ? (
                  <Image
                    src={meeting.imageUrl}
                    alt={meeting.title}
                    fill
                    className="rounded-lg object-cover"
                  />
                ) : meeting.book.imageUrl ? (
                  <Image
                    src={meeting.book.imageUrl}
                    alt={meeting.book.title}
                    fill
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-full h-full border-2 border-gray-200 rounded-lg flex flex-col items-center justify-center">
                    <ImageIcon className="text-gray-400 text-lg mb-1" />
                    <span className="text-gray-400 text-xs">이미지</span>
                  </div>
                )}
              </div>

              {/* 모임 정보 */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {meeting.title}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        📚 {meeting.book.title} (저자: {meeting.book.author})
                      </p>
                      <p>📍 {meeting.address}</p>
                      {meeting.detailedAddress && (
                        <p className="text-gray-500">
                          {' '}
                          {meeting.detailedAddress}
                        </p>
                      )}
                      <p>👥 최대 {meeting.maxParticipants}명</p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(meeting.meetingDate), 'M월 d일')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {meeting.startTime} - {meeting.endTime}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(meeting.meetingDate), 'EEEE')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
