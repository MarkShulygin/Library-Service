import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Grid,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  ArrowBackIos,
  ArrowForwardIos,
} from '@mui/icons-material';
import { Book } from '../types/book';
import { getBookById } from '../services/api';
import { readingService } from '../services/ReadingService';
import BookCover from '../components/BookCover';

const ReadBook: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const defaultContent = useMemo(() => [
    "Chapter 1: The clocks were striking thirteen. Winston Smith, his chin nuzzled into his chest, hurried home through the biting wind. The telescreens watched, the Party listened. Every thought, every whisper could be scrutinized. The past was mutable, rewritten at will. Winston, already a thought-criminal in his heart, knew this.",
    "Chapter 2: At work, Winston altered past newspaper records to fit the Party's ever-changing narrative. The lies piled up, each one building a reality more detached from truth. He scrawled in his hidden journal: \"DOWN WITH BIG BROTHER.\" It was rebellion, and he knew the consequences. Thoughtcrime was death.",
    "Chapter 3: Winston dreamt of the Golden Country, an untouched land beyond Party control. He saw Julia there, running freely. Yet, reality was cold and gray. The Party dictated love, hate, even history. Two plus two equaled five if the Party said so.",
    "Chapter 4: Winston encountered O'Brien, a man who seemed to understand his unspoken rebellion. Was he a friend, a foe, or a member of the Thought Police? The Brotherhood, whispered about in fear, might be real. Could Winston escape the iron grip of Big Brother?",
    "Chapter 5: Winston and Julia found solace in a small rented room above Mr. Charrington's shop. It was a sanctuary, free from the Party's watchful eyes—or so they thought. They whispered dreams of revolution, unaware that betrayal lurked in the walls, that the Party always heard, always saw."
  ], []);

  const saveProgress = React.useCallback(async (page: number) => {
    if (!id || !book?.content) return;
    try {
      await readingService.saveProgress({
        bookId: id,
        currentPage: page,
        progress: (page / book.content.length) * 100,
        totalPages: book.content.length
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [id, book]);

  const handlePageChange = useCallback((direction: 'prev' | 'next') => {
    if (!book?.content) return;
    let newPage = currentPage;
    if (direction === 'prev' && currentPage > 1) {
      newPage = currentPage - 1;
    } else if (direction === 'next' && currentPage < book.content.length) {
      newPage = currentPage + 1;
    }
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
      saveProgress(newPage);
    }
  }, [book, currentPage, saveProgress]);

  useEffect(() => {
    const loadBook = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const bookData = await getBookById(id);
        // Окремий запит на контент
        let content: string[] = [];
        try {
          const resp = await fetch(`/books/${id}/content`);
          if (resp.ok) {
            const data = await resp.json();
            content = data.pages || [];
          }
        } catch (e) {
          console.error('Error fetching book content:', e);
        }
        // Якщо контент не прийшов з бекенду, використовуємо запасний варіант
        if (!content || content.length === 0) {
          content = defaultContent;
        }
        bookData.content = content;
        setBook(bookData);

        // Завантажуємо прогрес читання
        const progress = await readingService.getProgress(id);
        if (progress) {
          setCurrentPage(progress.currentPage || 1);
        }
      } catch (error) {
        console.error('Error loading book:', error);
        setError('Failed to load book. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [id, defaultContent]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        handlePageChange('prev');
      } else if (event.key === 'ArrowRight') {
        handlePageChange('next');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, handlePageChange]); // eslint-disable-next-line react-hooks/exhaustive-deps

  const handleExit = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    navigate(`/book/${id}`);
  };

  if (loading) {
    return (
      <Container>
        <Typography variant="h5" sx={{ mb: 2 }}>Loading book...</Typography>
        <LinearProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography variant="h5" color="error">{error}</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/book/${id}`)}>
          Back to Book Details
        </Button>
      </Container>
    );
  }

  if (!book?.content || book.content.length === 0) {
    return (
      <Container>
        <Typography variant="h5">Book content is not available</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/book/${id}`)}>
          Назад До Бібліотеки
        </Button>
      </Container>
    );
  }

  const currentContent = book.content[currentPage - 1];
  const fallbackCover = '/default_cover.png'; // Place a default image in public/
  const coverUrl = book.cover_url || book.coverImage || fallbackCover;

  return (
    <Container maxWidth="lg" sx={{ py: 0 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        background: 'rgba(0, 0, 0, 0.69)', // легкий фон під блоком прогресу
        borderRadius: 3,
        px: 3,
        py: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleExit}
          sx={{
            color: '#fff',
            fontWeight: 700,
            backgroundColor: '#1565c0', // ще більш солідний синій
            transition: 'background 0.2s',
            boxShadow: '0 2px 8px rgba(21,101,192,0.18)',
            '&:hover': {
              backgroundColor: '#003c8f'
            }
          }}
        >
          Back to Details
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Page {currentPage} of {book.content.length}
          </Typography>
          <Box sx={{ width: 200, background: 'rgba(20, 30, 50, 0.92)', borderRadius: 2, p: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>
            <LinearProgress
              variant="determinate"
              value={(currentPage / book.content.length) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(180, 200, 255, 0.25)',
                backdropFilter: 'blur(2px)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#1976d2'
                }
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {Math.round((currentPage / book.content.length) * 100)}%
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Box sx={{ position: 'sticky', top: 24 }}>
            <BookCover
              title={book.title}
              author={book.author}
              subtitle={book.genre}
              year={book.publicationYear}
              coverUrl={coverUrl}
              height={400}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              minHeight: '70vh',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              backgroundColor: '#fffef9'
            }}
          >
            <Box sx={{ flex: 1, my: 4, position: 'relative' }}>
              <Typography 
                variant="body1" 
                paragraph
                sx={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '1.1rem',
                  lineHeight: 1.4, // менше міжрядковий інтервал
                  whiteSpace: 'pre-wrap',
                  color: '#2c1810',
                  height: '60vh', // фіксована висота сторінки
                  width: '100%',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: 2,
                  p: 2,
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 2px 8px rgba(44,24,16,0.04)'
                }}
              >
                {currentContent || 'Content not available'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Tooltip title="Previous Page (←)">
                <span>
                  <IconButton 
                    onClick={() => handlePageChange('prev')}
                    disabled={currentPage === 1}
                    sx={{
                      color: '#2c1810',
                      '&:hover': {
                        backgroundColor: 'rgba(44, 24, 16, 0.04)'
                      }
                    }}
                  >
                    <ArrowBackIos />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Next Page (→)">
                <span>
                  <IconButton 
                    onClick={() => handlePageChange('next')}
                    disabled={currentPage === book.content.length}
                    sx={{
                      color: '#2c1810',
                      '&:hover': {
                        backgroundColor: 'rgba(44, 24, 16, 0.04)'
                      }
                    }}
                  >
                    <ArrowForwardIos />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog 
        open={showExitDialog} 
        onClose={() => setShowExitDialog(false)}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(255,255,255,0.99)',
            boxShadow: 24,
            borderRadius: 3
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(10, 10, 10, 0.82)' // ще темніше
          }
        }}
      >
        <DialogTitle sx={{ color: '#1976d2', fontWeight: 700 }}>Вийти з режиму читання</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#1976d2', fontWeight: 500, textShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>
            Ваш прогрес читання збережено. Бажаєте вийти з режиму читання?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowExitDialog(false)}
            sx={{
              color: '#1976d2',
              fontWeight: 700,
              backgroundColor: 'rgba(25, 118, 210, 0.12)',
              borderRadius: 2,
              px: 3,
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.22)'
              }
            }}
          >
            Скасувати
          </Button>
          <Button 
            onClick={confirmExit} 
            variant="contained"
            sx={{
              backgroundColor: '#1976d2',
              color: '#fff',
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              '&:hover': {
                backgroundColor: '#115293'
              }
            }}
          >
            Вийти
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReadBook;
