export interface MeetingData {
  title: string;
  description: string;
  meetingDate: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  address: string;
  detailedAddress?: string;
  recommendationReason: string;
  range?: string;
  bookId: string;
  questions: string;
  attachments?: File[];
}
