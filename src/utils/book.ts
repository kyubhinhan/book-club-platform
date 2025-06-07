const STORAGE_KEY = 'bookRecommendationState';

export class BookRecommendationManager {
  static saveState(bookIds: string[]) {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(bookIds));
  }

  static getState(): string[] {
    if (typeof window === 'undefined') return [];

    try {
      const savedState = sessionStorage.getItem(STORAGE_KEY);
      return savedState ? JSON.parse(savedState) : [];
    } catch {
      return [];
    }
  }

  static clearState() {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(STORAGE_KEY);
  }
}
