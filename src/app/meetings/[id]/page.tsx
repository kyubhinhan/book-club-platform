import { Suspense } from 'react';
import MeetingDetail from '@/components/MeetingDetail';

export default function MeetingPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div>로딩 중...</div>}>
          <MeetingDetail meetingId={params.id} />
        </Suspense>
      </div>
    </div>
  );
}
