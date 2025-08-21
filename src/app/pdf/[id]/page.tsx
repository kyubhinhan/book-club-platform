import MeetingDetail from '@/components/MeetingDetail';

interface PDFPageProps {
  params: { id: string };
}

export default async function PDFPage({ params }: PDFPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-4xl mx-auto">
        <MeetingDetail meetingId={params.id} hideButtons={true} />
      </div>
    </div>
  );
}
