'use client';
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Meeting } from '@/types/meeting';

export default function MeetingDetail({ meetingId }: { meetingId: string }) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return <div>모임 정보를 불러오는 중...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
    );
  }

  if (!meeting) {
    return <div>모임을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">{meeting.title}</h1>
        <div className="space-y-2 text-gray-600">
          <p>주소: {meeting.address}</p>
          {meeting.detailedAddress && (
            <p>상세주소: {meeting.detailedAddress}</p>
          )}
          <p>
            일시: {format(new Date(meeting.meetingDate), 'yyyy년 M월 d일')}{' '}
            {meeting.startTime} - {meeting.endTime}
          </p>
          <p>최대 참가자: {meeting.maxParticipants}명</p>
          <p>
            도서: {meeting.book.title} (저자: {meeting.book.author})
          </p>
          <p>추천 이유: {meeting.recommendationReason}</p>
          <p>생성자: {meeting.creator.name || '알 수 없음'}</p>
          {meeting.description && <p>설명: {meeting.description}</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => (window.location.href = '/meetings')}
          className="px-4 py-2 text-gray-600 hover:text-primary-900"
        >
          목록으로 돌아가기
        </button>
      </div>
    </div>
  );
}
