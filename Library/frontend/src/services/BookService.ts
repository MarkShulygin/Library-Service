import api from './api';
import { Book } from '../types/book';

export const addBook = async (bookData: Partial<Book>) => {
  const response = await api.post('/books/admin/add', bookData);
  return response.data;
};

export const addBookWithFile = async (formData: FormData) => {
  const response = await api.post('/books/admin/add', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteBook = async (bookId: string) => {
  const response = await api.delete(`/books/${bookId}`);
  return response.data;
};
