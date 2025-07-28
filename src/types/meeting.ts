export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  isbn: string | null;
  category: string;
  imageUrl: string | null;
  link: string | null;
  publisher: string | null;
  price: number | null;
  pubDate: string | null;
  recommendationReason: string | null;
}

export interface Discussion {
  id: string;
  questions: string[];
  bookId: string;
  book: Book;
}

export interface Meeting {
  id: string;
  title: string;
  description: string | null;
  meetingDate: string;
  maxParticipants: number;
  address: string;
  detailedAddress: string | null;
  startTime: string;
  endTime: string;
  recommendationReason: string;
  range: string | null;
  imageUrl: string | null;
  bookId: string;
  book: Book;
  clubId: string | null;
  creatorId: string;
  creator: User;
  participants: User[];
  discussion: Discussion | null;
  createdAt: string;
  updatedAt: string;
}

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
  creatorId?: string; // API에서 자동으로 설정되므로 선택적
}
