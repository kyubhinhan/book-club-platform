import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface Meeting {
  id: string;
  title: string;
  date: string;
  location: string;
  book: {
    title: string;
    author: string;
  };
}

export default function MeetingList() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await fetch('/api/meetings');
      if (!response.ok) {
        throw new Error('모임 목록을 가져오는데 실패했습니다.');
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

  if (loading) {
    return <div>모임 목록을 불러오는 중...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">아직 생성된 모임이 없습니다.</p>
        <a
          href="/meetings/new"
          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          첫 모임 만들기
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {meetings.map((meeting) => (
        <a
          key={meeting.id}
          href={`/meetings/${meeting.id}`}
          className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold mb-2">{meeting.title}</h2>
              <p className="text-gray-600 mb-1">장소: {meeting.location}</p>
              <p className="text-gray-600">
                도서: {meeting.book.title} (저자: {meeting.book.author})
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {format(new Date(meeting.date), 'yyyy년 M월 d일')}
              </p>
              <p className="text-sm text-gray-500">
                {format(new Date(meeting.date), 'HH:mm')}
              </p>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
