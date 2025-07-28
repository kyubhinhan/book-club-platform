'use client';
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Meeting } from '@/types/meeting';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import {
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Book as BookIcon,
  QuestionAnswer as QuestionIcon,
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';

export default function MeetingDetail({ meetingId }: { meetingId: string }) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { data: session } = useSession();

  const fetchMeetingDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}`);

      if (!response.ok) {
        throw new Error('모임 정보를 가져오는데 실패했습니다.');
      }

      const meetingData = await response.json();
      setMeeting(meetingData.meeting);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  useEffect(() => {
    fetchMeetingDetails();
  }, [fetchMeetingDetails, meetingId]);

  // 현재 사용자가 모임 생성자인지 확인
  const isCreator =
    session?.user &&
    'id' in session.user &&
    session.user.id === meeting?.creatorId;

  // 이미지 업로드 처리
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !meeting) return;

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`/api/meetings/${meetingId}/image`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        // 모임 정보 업데이트
        setMeeting((prev) =>
          prev ? { ...prev, imageUrl: result.imageUrl } : null
        );
        alert('이미지가 성공적으로 업로드되었습니다.');
      } else {
        const errorData = await response.json();
        alert(errorData.error || '이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">모임 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-lg">모임을 찾을 수 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* 모임 이미지 */}
            <div className="relative">
              {meeting.imageUrl ? (
                <div className="relative">
                  <Image
                    src={meeting.imageUrl}
                    alt={meeting.title}
                    width={300}
                    height={200}
                    className="rounded-lg shadow-md object-cover"
                  />
                  {isCreator && (
                    <label className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-50 transition-colors">
                      <PhotoCameraIcon className="text-gray-600" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  )}
                </div>
              ) : (
                <div className="w-[300px] h-[200px] bg-gray-200 rounded-lg flex items-center justify-center relative">
                  {isCreator ? (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-300 transition-colors">
                      <PhotoCameraIcon className="text-gray-400 text-4xl mb-2" />
                      <span className="text-gray-500 text-sm">이미지 추가</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  ) : (
                    <PhotoCameraIcon className="text-gray-400 text-4xl" />
                  )}
                </div>
              )}
              {uploadingImage && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            {/* 모임 제목 및 정보 */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {meeting.title}
              </h1>
              <p className="text-lg text-gray-600">독서 모임 상세 정보</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* 모임 정보 카드 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              📅 모임 정보
            </h2>
            <div className="space-y-6">
              {/* 기본 모임 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">모임일</p>
                    <p className="font-medium">
                      {format(
                        new Date(meeting.meetingDate),
                        'yyyy년 M월 d일 (EEEE)'
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TimeIcon className="text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">시간</p>
                    <p className="font-medium">
                      {meeting.startTime} - {meeting.endTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <LocationIcon className="text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">장소</p>
                    <p className="font-medium">{meeting.address}</p>
                    {meeting.detailedAddress && (
                      <p className="text-sm text-gray-600">
                        {meeting.detailedAddress}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <GroupIcon className="text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">최대 참가자</p>
                    <p className="font-medium">{meeting.maxParticipants}명</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <PersonIcon className="text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">모임 생성자</p>
                    <p className="font-medium text-gray-900">
                      {meeting.creator.name || '알 수 없음'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 모임 소개 */}
              {meeting.description && (
                <div className="mt-6">
                  <div className="bg-gray-50 rounded-lg p-5">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        모임 소개
                      </h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {meeting.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 책 정보 카드 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookIcon className="text-blue-600" />
              도서 정보
            </h2>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex justify-center md:justify-start">
                  {meeting.book.imageUrl ? (
                    <Image
                      src={meeting.book.imageUrl}
                      alt={meeting.book.title}
                      width={200}
                      height={280}
                      className="rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="w-48 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <BookIcon className="text-gray-400 text-4xl" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-center md:text-left">
                    <h3 className="font-semibold text-2xl text-gray-900 mb-2">
                      {meeting.book.title}
                    </h3>
                    <p className="text-lg text-gray-600 mb-3">
                      저자: {meeting.book.author}
                    </p>
                    {meeting.book.link && (
                      <p className="text-gray-500 mb-3">
                        <a
                          href={meeting.book.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          상세 정보 보기 →
                        </a>
                      </p>
                    )}
                  </div>

                  {/* 선정 이유 */}
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      선정 이유
                    </h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {meeting.recommendationReason}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 발제문 카드 */}
          {meeting.discussion && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <QuestionIcon className="text-blue-600" />
                발제문
              </h2>
              <div className="space-y-4">
                {meeting.discussion.questions.map((question, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <p className="text-gray-700 leading-relaxed">
                        {question}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 참가자 정보 카드 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              👥 참가자
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {meeting.participants?.length > 0 ? (
                meeting.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <PersonIcon className="text-gray-600 text-sm" />
                    </div>
                    <span className="text-gray-700">
                      {participant.name || '알 수 없음'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-full">
                  <p className="text-gray-500 text-center py-8">
                    아직 참가자가 없습니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => (window.location.href = '/meetings')}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            목록으로 돌아가기
          </button>
          {isCreator && (
            <button
              onClick={() =>
                (window.location.href = `/meetings/${meetingId}/edit`)
              }
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <EditIcon className="text-sm" />
              수정하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
