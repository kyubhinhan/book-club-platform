import { Suspense } from 'react';
import MeetingList from '@/components/MeetingList';

export default function MeetingsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">모임 목록</h1>
          <a
            href="/meetings/new"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            새 모임 만들기
          </a>
        </div>

        <Suspense fallback={<div>로딩 중...</div>}>
          <MeetingList />
        </Suspense>
      </div>
    </main>
  );
} 