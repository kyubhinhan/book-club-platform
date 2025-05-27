import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';

interface DateOption {
  date: string;
  votes: number;
}

export default function MeetingCreation() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [dateOptions, setDateOptions] = useState<DateOption[]>([
    { date: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'), votes: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addDateOption = () => {
    setDateOptions([
      ...dateOptions,
      { date: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'), votes: 0 }
    ]);
  };

  const removeDateOption = (index: number) => {
    setDateOptions(dateOptions.filter((_, i) => i !== index));
  };

  const updateDateOption = (index: number, newDate: string) => {
    const newOptions = [...dateOptions];
    newOptions[index] = { ...newOptions[index], date: newDate };
    setDateOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (dateOptions.length === 0) {
      setError('최소 하나의 일정 옵션이 필요합니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          location,
          dateOptions,
        }),
      });

      if (!response.ok) {
        throw new Error('모임 생성에 실패했습니다.');
      }

      const data = await response.json();
      // 생성된 모임 페이지로 이동
      window.location.href = `/meetings/${data.meeting.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">모임 일정 만들기</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            모임 제목
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            모임 장소
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              일정 옵션
            </label>
            <button
              type="button"
              onClick={addDateOption}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + 일정 추가
            </button>
          </div>
          
          <div className="space-y-3">
            {dateOptions.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="datetime-local"
                  value={option.date}
                  onChange={(e) => updateDateOption(index, e.target.value)}
                  className="flex-1 p-2 border rounded-lg"
                  required
                />
                {dateOptions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDateOption(index)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300"
        >
          {loading ? '생성 중...' : '모임 만들기'}
        </button>
      </form>
    </div>
  );
} 