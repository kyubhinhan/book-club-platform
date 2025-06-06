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

  /**
   * 도서 추천 페이지의 상태를 저장하는 키
   */
  recommendationState: 'bookRecommendationState',
} as const;

/**
 * 도서 추천 상태 관리 함수들
 */
export const BookRecommendationManager = {
  /**
   * 도서 추천 상태를 저장합니다.
   * @param bookIds 현재 추천된 도서 ID 목록
   */
  saveState: (bookIds: string[]) => {
    sessionStorage.setItem(
      MeetingStorageKeys.recommendationState,
      JSON.stringify(bookIds)
    );
  },

  /**
   * 저장된 도서 추천 상태를 가져옵니다.
   * @returns 저장된 도서 ID 목록
   */
  getState: (): string[] => {
    const state = sessionStorage.getItem(
      MeetingStorageKeys.recommendationState
    );
    return state ? JSON.parse(state) : [];
  },

  /**
   * 저장된 도서 추천 상태를 초기화합니다.
   */
  clearState: () => {
    sessionStorage.removeItem(MeetingStorageKeys.recommendationState);
  },
} as const;
