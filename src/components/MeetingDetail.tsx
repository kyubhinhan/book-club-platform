import { format } from 'date-fns';
import { Meeting } from '@/types/meeting';
import Image from 'next/image';
import Link from 'next/link';
import {
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Book as BookIcon,
  QuestionAnswer as QuestionIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface MeetingDetailProps {
  meetingId: string;
}

async function getMeetingData(meetingId: string): Promise<Meeting> {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: {
      book: true,
      creator: true,
      discussion: true,
      attachments: true,
      participants: true,
    },
  });

  if (!meeting) {
    notFound();
  }

  return meeting;
}

export default async function MeetingDetail({ meetingId }: MeetingDetailProps) {
  const meeting = await getMeetingData(meetingId);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* 모임 제목 및 정보 */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {meeting.title}
              </h1>
              <p className="text-lg text-gray-600">독서 모임 상세 정보</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* 모임 정보 카드 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              📅 모임 정보
            </h2>
            <div className="flex gap-6">
              {/* 모임 이미지 */}
              {meeting.imageUrl ? (
                <div className="flex-shrink-0 w-[200px] h-[200px] relative flex items-center justify-center">
                  <Image
                    src={meeting.imageUrl}
                    alt={meeting.title}
                    fill
                    className="rounded-lg shadow-md object-cover"
                  />
                </div>
              ) : (
                <></>
              )}

              {/* 모임 정보 */}
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">모임일</p>
                      <p className="font-medium">
                        {format(
                          new Date(meeting.meetingDate),
                          'yyyy년 M월 d일 (EEEE)'
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <TimeIcon className="text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">시간</p>
                      <p className="font-medium">
                        {meeting.startTime} - {meeting.endTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <LocationIcon className="text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">장소</p>
                      <p className="font-medium">{meeting.address}</p>
                      {meeting.detailedAddress && (
                        <p className="text-sm text-gray-600">
                          {meeting.detailedAddress}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <PersonIcon className="text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">모임 생성자</p>
                      <p className="font-medium text-gray-900">
                        {meeting.creator.name || '알 수 없음'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 모임 소개 */}
            {meeting.description && (
              <div className="mt-6">
                <div className="bg-gray-50 rounded-lg p-5">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      모임 소개
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {meeting.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 첨부파일 */}
            {meeting.attachments && meeting.attachments.length > 0 && (
              <div className="mt-6">
                <div className="bg-gray-50 rounded-lg p-5">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      📎 첨부파일
                    </h3>
                    <div className="space-y-2">
                      {meeting.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              📄
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {attachment.originalName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {(attachment.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <a
                            href={`/api/attachments/${attachment.id}/download`}
                            download
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                          >
                            다운로드
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 책 정보 카드 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookIcon className="text-blue-600" />
              도서 정보
            </h2>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex justify-center md:justify-start">
                  {meeting.book.imageUrl ? (
                    <Image
                      src={meeting.book.imageUrl}
                      alt={meeting.book.title}
                      width={200}
                      height={280}
                      className="rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="w-48 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <BookIcon className="text-gray-400 text-4xl" />
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="text-center md:text-left">
                    <h3 className="font-semibold text-2xl text-gray-900 mb-2">
                      {meeting.book.title}
                    </h3>
                    <p className="text-lg text-gray-600 mb-3">
                      저자: {meeting.book.author}
                    </p>
                    {meeting.book.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                        {meeting.book.description}
                      </p>
                    )}
                  </div>

                  {/* 선정 이유 */}
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      선정 이유
                    </h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {meeting.recommendationReason}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 발제문 카드 */}
          {meeting.discussion && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <QuestionIcon className="text-blue-600" />
                발제문
              </h2>
              <div className="space-y-4">
                {meeting.discussion.questions.map((question, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <p className="text-gray-700 leading-relaxed">
                        {question}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/meetings"
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            목록으로 돌아가기
          </Link>
          <a
            href={`/api/meetings/${meetingId}/pdf`}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            📄 PDF로 다운로드
          </a>
          <Link
            href={`/meetings/${meetingId}/edit`}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <EditIcon className="text-sm" />
            수정하기
          </Link>
        </div>
      </div>
    </div>
  );
}
