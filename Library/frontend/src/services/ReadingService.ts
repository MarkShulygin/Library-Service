import api from './api';

interface ReadingProgress {
  bookId: string;
  currentPage: number;
  progress: number;
  userId?: string;
  totalPages?: number;
  status?: 'in_progress' | 'completed';
  lastReadAt?: Date;
}

class ReadingService {
  private readonly STORAGE_KEY = 'reading_progress';
  private readonly API_URL = '/reading';

  private getProgressKey(bookId: string): string {
    return `${this.STORAGE_KEY}_${bookId}`;
  }

  async saveProgress(progress: ReadingProgress): Promise<void> {
    try {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        await api.post(`${this.API_URL}/start`, {
          user_id: userId,
          book_id: progress.bookId,
          page: progress.currentPage
        });
      }
      const key = this.getProgressKey(progress.bookId);
      localStorage.setItem(key, JSON.stringify({
        ...progress,
        lastReadAt: new Date(),
        status: progress.currentPage === progress.totalPages ? 'completed' : 'in_progress'
      }));
    } catch (error) {
      console.error('Error saving reading progress:', error);
      const key = this.getProgressKey(progress.bookId);
      localStorage.setItem(key, JSON.stringify({
        ...progress,
        lastReadAt: new Date(),
        status: progress.currentPage === progress.totalPages ? 'completed' : 'in_progress'
      }));
    }
  }

  async getProgress(bookId: string): Promise<ReadingProgress | null> {
    try {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        const encodedUserId = encodeURIComponent(userId);
        const response = await api.get(`${this.API_URL}/progress/${encodedUserId}`);
        const progressList = response.data;
        const bookProgress = progressList.find((p: any) => p.book_id === bookId || p.bookId === bookId);
        if (bookProgress) {
          return {
            bookId: bookProgress.book_id || bookProgress.bookId,
            currentPage: bookProgress.current_page || bookProgress.currentPage,
            progress: bookProgress.page || bookProgress.progress,
            userId: bookProgress.user_id || bookProgress.userId,
            lastReadAt: new Date(bookProgress.updatedAt || bookProgress.lastReadAt),
            status: 'in_progress'
          };
        }
        // Якщо прогресу немає в бекенді — повертаємо null, localStorage ігноруємо
        return null;
      }
    } catch (error) {
      console.error('Error getting reading progress from backend:', error);
    }
    // Якщо немає user_id, можна брати з localStorage (гостьовий режим)
    const key = this.getProgressKey(bookId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  async getAllProgress(): Promise<Record<string, ReadingProgress>> {
    const progress: Record<string, ReadingProgress> = {};
    try {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        const encodedUserId = encodeURIComponent(userId);
        const response = await api.get(`${this.API_URL}/progress/${encodedUserId}`);
        const progressList = response.data;
        progressList.forEach((p: any) => {
          progress[p.book_id || p.bookId] = {
            bookId: p.book_id || p.bookId,
            currentPage: p.current_page || p.currentPage,
            progress: p.page || p.progress,
            userId: p.user_id || p.userId,
            lastReadAt: new Date(p.updatedAt || p.lastReadAt),
            status: 'in_progress'
          };
        });
        return progress;
      }
    } catch (error) {
      console.error('Error getting all reading progress from backend:', error);
    }
    // Якщо немає user_id, можна брати з localStorage (гостьовий режим)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.STORAGE_KEY)) {
        const bookId = key.replace(`${this.STORAGE_KEY}_`, '');
        const data = localStorage.getItem(key);
        if (data) {
          progress[bookId] = JSON.parse(data);
        }
      }
    }
    return progress;
  }

  async clearProgress(bookId: string): Promise<void> {
    try {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        const encodedUserId = encodeURIComponent(userId);
        const encodedBookId = encodeURIComponent(bookId);
        await api.delete(`${this.API_URL}/progress/${encodedUserId}/${encodedBookId}`);
      }
    } catch (error) {
      console.error('Error clearing reading progress from backend:', error);
    }
    const key = this.getProgressKey(bookId);
    localStorage.removeItem(key);
  }
}

export const readingService = new ReadingService();
export type { ReadingProgress };
