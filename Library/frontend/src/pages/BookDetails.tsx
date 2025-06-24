import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Grid,
  LinearProgress,
  Divider,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Book } from '../types/book';
import { getBookById } from '../services/api';
import { readingService } from '../services/ReadingService';
import BookCover from '../components/BookCover';

const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBook = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const bookData = await getBookById(id);
        setBook(bookData);

        const progress = await readingService.getProgress(id);
        if (progress) {
          setReadingProgress(progress.progress);
        }
      } catch (error) {
        console.error('Error loading book:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Завантаження книги...
        </Typography>
        <LinearProgress />
      </Container>
    );
  }

  if (!book) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Книгу не знайдено
        </Typography>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          variant="outlined"
        >
          Повернутись до бібліотеки
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Box sx={{ position: 'sticky', top: 24 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ width: '100%', maxWidth: 320, display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={() => navigate('/')}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    transition: 'none',
                    minWidth: 0,
                    px: 2,
                    ml: 1,
                    '&:hover': {
                      // backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    }
                  }}
                >
                  Назад
                </Button>
              </Box>
              <Box sx={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <BookCover
                  title={book.title}
                  author={book.author}
                  subtitle={book.genre}
                  year={book.publicationYear || book.year}
                  coverUrl={(book as any).cover_url || book.coverImage}
                  height={400}
                />
                <Box sx={{ mt: 3, width: '100%' }}>
                  {readingProgress > 0 && (
                    <Paper
                      elevation={2}
                      sx={{
                        mb: 2,
                        p: 2,
                        borderRadius: 3,
                        backgroundColor: 'rgba(30, 30, 30, 0.6)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                      }}
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        Прогрес читання: {Math.round(readingProgress)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={readingProgress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'rgba(142, 36, 170, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(90deg, #8e24aa, #00e5ff)'
                          }
                        }}
                      />
                    </Paper>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/read/${book.id}`)}
                      sx={{
                        borderRadius: 2,
                        px: 4,
                        py: 1,
                        fontWeight: 'bold',
                        mt: 1
                      }}
                    >
                      {readingProgress > 0 ? 'Продовжити читання' : 'Читати книгу'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <Typography variant="h4" gutterBottom>
              {book.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {book.author}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Жанр
              </Typography>
              <Typography variant="body1">{book.genre || ''}</Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Рік публікації
              </Typography>
              <Typography variant="body1">{book.publicationYear || book.year || ''}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Опис
              </Typography>
              <Typography variant="body1" paragraph>
                {book.description}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BookDetails;
