import { Suspense } from 'react';
import MeetingList from '@/components/MeetingList';

export default function MeetingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">모임 목록</h1>
        </div>

        <Suspense fallback={<div>로딩 중...</div>}>
          <MeetingList />
        </Suspense>
      </div>
    </div>
  );
}
