import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface DateVote {
  id: string;
  date: string;
  votes: number;
}

interface Meeting {
  id: string;
  title: string;
  location: string;
  date: string;
  book: {
    title: string;
    author: string;
  };
  dateVotes: DateVote[];
}

export default function MeetingDetail({ meetingId }: { meetingId: string }) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votingLoading, setVotingLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchMeetingDetails();
  }, [meetingId]);

  const fetchMeetingDetails = async () => {
    try {
      const [meetingResponse, votesResponse] = await Promise.all([
        fetch(`/api/meetings/${meetingId}`),
        fetch(`/api/meetings/${meetingId}/vote`),
      ]);

      if (!meetingResponse.ok || !votesResponse.ok) {
        throw new Error('모임 정보를 가져오는데 실패했습니다.');
      }

      const meetingData = await meetingResponse.json();
      const votesData = await votesResponse.json();

      setMeeting({
        ...meetingData.meeting,
        dateVotes: votesData.votes,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (dateId: string) => {
    setVotingLoading(dateId);
    try {
      const response = await fetch(`/api/meetings/${meetingId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dateId }),
      });

      if (!response.ok) {
        throw new Error('투표에 실패했습니다.');
      }

      // 투표 결과 새로고침
      await fetchMeetingDetails();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      );
    } finally {
      setVotingLoading(null);
    }
  };

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
        <p className="text-gray-600">장소: {meeting.location}</p>
        <p className="text-gray-600">
          도서: {meeting.book.title} (저자: {meeting.book.author})
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">일정 투표</h2>
        <div className="space-y-4">
          {meeting.dateVotes.map((vote) => (
            <div
              key={vote.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-medium">
                  {format(new Date(vote.date), 'yyyy년 M월 d일 HH:mm')}
                </p>
                <p className="text-gray-600">현재 {vote.votes}표</p>
              </div>
              <button
                onClick={() => handleVote(vote.id)}
                disabled={votingLoading === vote.id}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:bg-primary-300"
              >
                {votingLoading === vote.id ? '투표 중...' : '투표하기'}
              </button>
            </div>
          ))}
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
