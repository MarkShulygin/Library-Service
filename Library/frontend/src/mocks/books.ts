import { Book } from '../types/book';

export const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Кобзар',
    author: 'Тарас Шевченко',
    genre: 'Поезія',
    description: 'Збірка поетичних творів Тараса Шевченка...',
    coverImage: 'https://upload.wikimedia.org/.../Кобзар_1840.jpg',
    content: [
      'Думи мої, думи мої...',
      'За карії оченята...',
      'Квіти мої, діти!...',
    ],
    fileUrl: 'https://example.com/books/kobzar.pdf', // 🔹 Можна моково вставити посилання
    createdAt: '2024-01-15T10:00:00Z',               // 🔹 Будь-яка ISO-строка дати
    publicationYear: 1840                            // 🔹 Реальний рік або вигаданий
  },
];
