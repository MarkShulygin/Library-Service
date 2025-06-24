import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  FormControl,
  Select,
  MenuItem,
  Box,
  SelectChangeEvent,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { Book } from '../../types/book';
import { getBooks } from '../../services/api';
import { readingService } from '../../services/ReadingService';
import BookCover from '../BookCover';
import { addBookWithFile, deleteBook } from '../../services/BookService';
import { useAuth } from '../../context/AuthContext';

const BookList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('');
  const [readingProgress, setReadingProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newBook, setNewBook] = useState<Partial<Book & { pages?: number }>>({
    title: '',
    author: '',
    genre: '',
    publicationYear: undefined,
    description: '',
    fileUrl: '',
    createdAt: '',
    coverImage: '',
    content: [],
    pages: undefined
  });
  const [newBookFile, setNewBookFile] = useState<File | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    const loadAllBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const booksData = await getBooks();
        if (!Array.isArray(booksData)) {
          throw new Error('Invalid books data received');
        }
        setBooks(booksData);
        setFilteredBooks(booksData);
        const uniqueGenres = [...new Set(booksData.map((book: Book) => book.genre))] as string[];
        const uniqueAuthors = [...new Set(booksData.map((book: Book) => book.author))] as string[];
        setGenres(uniqueGenres);
        setAuthors(uniqueAuthors);
      } catch (err: any) {
        console.error('Error loading books:', err);
        setError(err.message || 'Failed to load books');
        setBooks([]);
        setFilteredBooks([]);
      } finally {
        setLoading(false);
      }
    };
    loadAllBooks();
  }, []);

  useEffect(() => {
    if (books.length === 0) return;
    let result = [...books];
    if (selectedGenre) {
      result = result.filter(book => book.genre === selectedGenre);
    }
    if (selectedAuthor) {
      result = result.filter(book => book.author === selectedAuthor);
    }
    setFilteredBooks(result);
  }, [books, selectedGenre, selectedAuthor]);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const allProgress = await readingService.getAllProgress();
        // Формуємо мапу: bookId -> % прогресу (0 якщо немає)
        const progressMap = books.reduce((acc, book) => {
          const progress = allProgress[book.id];
          const totalPages = book.pages || book.content?.length || 1;
          let percent = 0;
          if (progress && progress.currentPage && totalPages > 0) {
            percent = Math.round((progress.currentPage / totalPages) * 100);
            if (percent > 100) percent = 100;
          }
          acc[book.id] = percent;
          return acc;
        }, {} as Record<string, number>);
        setReadingProgress(progressMap);
      } catch (error) {
        console.error('Error loading reading progress:', error);
      }
    };
    loadProgress();
  }, [books]);

  const handleGenreChange = (event: SelectChangeEvent<string>) => setSelectedGenre(event.target.value);
  const handleAuthorChange = (event: SelectChangeEvent<string>) => setSelectedAuthor(event.target.value);
  const handleBookClick = (bookId: string) => navigate(`/book/${bookId}`);

  const handleDelete = async (bookId: string) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цю книгу?')) return;
    try {
      await deleteBook(bookId);
      setBooks(books.filter(b => b.id !== bookId));
      setFilteredBooks(filteredBooks.filter(b => b.id !== bookId));
    } catch (err: any) {
      alert('Помилка при видаленні книги: ' + (err?.message || ''));
    }
  };

  const handleAddBook = async () => {
    setAddError(null);
    try {
      if (!newBook.title || !newBook.author || !newBook.genre || !newBook.publicationYear || !newBookFile) {
        setAddError('Всі поля, крім обкладинки, обовʼязкові. Додайте файл книги!');
        return;
      }
      const formData = new FormData();
      formData.append('title', newBook.title);
      formData.append('author', newBook.author);
      formData.append('genre', newBook.genre);
      formData.append('description', newBook.description || '');
      formData.append('year', String(newBook.publicationYear));
      formData.append('cover_url', newBook.coverImage || '');
      formData.append('file', newBookFile);
      // pages визначає бекенд
      const added = await addBookWithFile(formData);
      setBooks([added, ...books]);
      setFilteredBooks([added, ...filteredBooks]);
      setAddDialogOpen(false);
      setNewBook({
        title: '',
        author: '',
        genre: '',
        publicationYear: undefined,
        description: '',
        fileUrl: '',
        createdAt: '',
        coverImage: '',
        content: [],
        pages: undefined
      });
      setNewBookFile(null);
    } catch (err: any) {
      setAddError('Помилка при додаванні книги: ' + (err?.message || ''));
    }
  };

  if (loading) return <Box sx={{ width: '100%', mt: 4 }}><LinearProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;

  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      {isAdmin && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="secondary" onClick={() => setAddDialogOpen(true)}>
            Додати книгу
          </Button>
        </Box>
      )}
      {/* Діалог додавання книги */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Додати нову книгу</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 350 }}>
          <TextField label="Назва" value={newBook.title} onChange={e => setNewBook({ ...newBook, title: e.target.value })} required />
          <TextField label="Автор" value={newBook.author} onChange={e => setNewBook({ ...newBook, author: e.target.value })} required />
          <TextField label="Жанр" value={newBook.genre} onChange={e => setNewBook({ ...newBook, genre: e.target.value })} required />
          <TextField label="Рік видання" type="number" value={newBook.publicationYear || ''} onChange={e => setNewBook({ ...newBook, publicationYear: Number(e.target.value) })} required />
          <TextField label="Кількість сторінок" type="number" value={newBook.pages || ''} onChange={e => setNewBook({ ...newBook, pages: Number(e.target.value) })} required />
          <TextField label="Опис" value={newBook.description} onChange={e => setNewBook({ ...newBook, description: e.target.value })} multiline rows={2} />
          <TextField label="URL обкладинки" value={newBook.coverImage} onChange={e => setNewBook({ ...newBook, coverImage: e.target.value })} />
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={e => setNewBookFile(e.target.files?.[0] || null)}
            style={{ marginTop: 8 }}
          />
          {addError && <Alert severity="error">{addError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Скасувати</Button>
          <Button onClick={handleAddBook} variant="contained">Додати</Button>
        </DialogActions>
      </Dialog>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3} lg={2.5}>
          <Box sx={{ p: 3, borderRadius: 2, background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(10px)', boxShadow: 3, border: '2px solid rgba(255,255,255,0.1)', position: 'sticky', top: 80 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.light', textAlign: 'center' }}>Фільтри</Typography>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Жанр</Typography>
            <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 3 }}>
              <Select value={selectedGenre} onChange={handleGenreChange} displayEmpty>
                <MenuItem value="">Всі жанри</MenuItem>
                {genres.map((genre) => <MenuItem key={genre} value={genre}>{genre}</MenuItem>)}
              </Select>
            </FormControl>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Автор</Typography>
            <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
              <Select value={selectedAuthor} onChange={handleAuthorChange} displayEmpty>
                <MenuItem value="">Всі автори</MenuItem>
                {authors.map((author) => <MenuItem key={author} value={author}>{author}</MenuItem>)}
              </Select>
            </FormControl>
            {(selectedGenre || selectedAuthor) && (
              <Button fullWidth variant="outlined" color="secondary" onClick={() => { setSelectedGenre(''); setSelectedAuthor(''); }}>
                Скинути фільтри
              </Button>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={9} lg={9.5}>
          {filteredBooks.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '30vh', p: 4, borderRadius: 4, background: 'rgba(0, 0, 0, 0.05)' }}>
              <Typography variant="h6" align="center" sx={{ mb: 2 }}>Книг не знайдено</Typography>
              <Typography variant="body2" align="center" color="text.secondary">Спробуйте змінити параметри фільтрації</Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{filteredBooks.length} {filteredBooks.length === 1 ? 'книга' : filteredBooks.length > 1 && filteredBooks.length < 5 ? 'книги' : 'книг'}</Typography>
              </Box>
              <Grid container spacing={3}>
                {filteredBooks.map((book) => (
                  <Grid item key={book.id} xs={12} sm={6} md={6} lg={4}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 4,
                        overflow: 'hidden',
                        background: 'rgba(30, 30, 30, 0.6)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
                        }
                      }}
                      onClick={() => handleBookClick(book.id)}
                    >
                      <Box sx={{ p: 3, pb: 0, display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{ width: '100%', maxWidth: 220, aspectRatio: '3/4', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', transition: 'transform 0.3s ease', '&:hover': { transform: 'scale(1.05)' } }}>
                          <BookCover 
                            title={book.title} 
                            author={book.author} 
                            subtitle={book.genre} 
                            year={book.publicationYear || book.year} 
                            coverUrl={(book as any).cover_url || book.coverImage} 
                            height={300} 
                          />
                        </Box>
                      </Box>
                      <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                        <Typography variant="h6" align="center" sx={{ fontWeight: 'bold', mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{book.title}</Typography>
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>{book.author}</Typography>
                        {/* Яскравий прогрес читання між автором і кнопками */}
                        <Box sx={{
                          my: 1.5,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 0.5,
                        }}>
                          <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, letterSpacing: 1, textShadow: '0 2px 8pxrgb(143, 143, 143)', mb: 0.5 }}>
                            Прогрес читання
                          </Typography>
                          <Box sx={{ width: '90%', maxWidth: 180 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={typeof readingProgress[book.id] === 'number' ? readingProgress[book.id] : 0} 
                              sx={{
                                height: 10,
                                borderRadius: 5,
                                background: 'rgba(0, 128, 255, 0.18)',
                                boxShadow: '0 2px 8px #1976d2',
                                '& .MuiLinearProgress-bar': {
                                  background: 'linear-gradient(90deg, #1976d2 60%, #00e5ff 100%)',
                                  boxShadow: '0 2px 8px #1976d2',
                                }
                              }}
                            />
                            <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 700, ml: 1 }}>
                              {typeof readingProgress[book.id] === 'number' ? Math.round(readingProgress[book.id]) : 0}%
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                          {/* <Typography variant="caption" sx={{ bgcolor: 'rgba(142, 36, 170, 0.1)', color: 'primary.light', px: 1.5, py: 0.5, borderRadius: 10 }}>{book.genre}</Typography> */}
                          {book.publicationYear && <Typography variant="caption" sx={{ bgcolor: 'rgba(0, 229, 255, 0.1)', color: 'secondary.light', px: 1.5, py: 0.5, borderRadius: 10 }}>{book.publicationYear}</Typography>}
                        </Box>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'center', gap: 0.5, pb: 3, px: 3 }}>
                        <Button size="small" onClick={(e) => { e.stopPropagation(); handleBookClick(book.id); }} sx={{ borderRadius: 2, flex: 1 }} variant="outlined" color="secondary">Деталі</Button>
                        <Button size="small"
                          onClick={(e) => { e.stopPropagation(); navigate(`/read/${book.id}`); }}
                          sx={{
                            borderRadius: 2,
                            flex: 1,
                            minWidth: readingProgress[book.id] ? 120 : 80, // ширша для "Продовжити"
                            px: readingProgress[book.id] ? 2.5 : 1.5,
                            fontWeight: 700
                          }}
                          variant="contained"
                          color="primary"
                        >
                          {readingProgress[book.id] ? 'Продовжити' : 'Читати'}
                        </Button>
                        {isAdmin && (
                          <Button size="small" color="error" variant="outlined" sx={{ borderRadius: 2 }} onClick={e => { e.stopPropagation(); handleDelete(book.id); }}>Видалити</Button>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default BookList;
