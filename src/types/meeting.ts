export interface MeetingData {
  title: string;
  description: string;
  meetingDate: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  location: string;
  recommendationReason: string;
  range?: string;
  bookId: string;
  questions: string;
  attachments?: File[];
}
