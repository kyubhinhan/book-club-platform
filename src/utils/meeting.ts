/**
 * 미팅 관련 스토리지 키를 생성하는 함수들
 */
export const MeetingStorageKeys = {
  /**
   * 발제 질문 데이터의 스토리지 키를 생성합니다.
   * @param bookId 도서 ID
   * @returns 스토리지 키
   */
  discussion: (bookId: string) => `meetingDiscussion_${bookId}`,
} as const;
