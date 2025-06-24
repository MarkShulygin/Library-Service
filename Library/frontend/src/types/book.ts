export interface Book {
  cover_url?: string; // optional, matches backend and allows fallback
  id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  fileUrl: string;
  createdAt: string;
  publicationYear: number;
  year?: number; // для сумісності з бекендом
  coverImage?: string;
  content: string[];
  pages?: number; // додано для коректної типізації
}

export interface BookFilters {
  genre?: string;
  author?: string;
}

export interface ReadingProgress {
  bookId: string;
  currentPage: number;
  progress: number;
  userId?: string;
  totalPages?: number;
  status?: 'in_progress' | 'completed';
  lastReadAt?: Date;
}
