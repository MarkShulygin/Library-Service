import React, { useMemo } from 'react';
import { Paper, Typography, Box } from '@mui/material';

interface BookCoverProps {
  title: string;
  author: string;
  subtitle?: string;
  publisher?: string;
  publisherLocation?: string;
  year?: number;
  width?: number | string;
  height?: number | string;
  coverUrl?: string; // додано для зображення
}

const BookCover: React.FC<BookCoverProps> = ({
  title,
  author,
  subtitle,
  publisher,
  publisherLocation,
  year,
  width = 300,
  height = 400,
  coverUrl,
}) => {
  /* ---------- фон ---------- */
  const coverGradient = useMemo(() => {
    /* детерміновано зсуваємо відтінок навколо синього */
    const hue = (title.split('')
      .reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 40) + 200; // 200-240°
    const base = `hsl(${hue}, 75%, 45%)`;      // яскраво-синій
    const dark = '#1e1e2f';                    // темний низ
    return `linear-gradient(135deg, ${base} 0%, ${dark} 100%)`;
  }, [title]);

  /* ---------- легкий патерн ---------- */
  const patternStyle = useMemo(() => ({
    background:
      'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
    backgroundSize: '12px 12px',
  }), []);

  if (coverUrl) {
    return (
      <Paper
        elevation={6}
        sx={{
          width, height, p: 0, overflow: 'hidden', borderRadius: 3, position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#222',
        }}
      >
        <img
          src={coverUrl}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={6}
      sx={{
        width, height, p: 3,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden', borderRadius: 3,
        background: coverGradient,
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        transition: 'transform 0.3s',
        '&:hover': { transform: 'translateY(-4px)' },

        /* патерн */
        '&::before': {
          content: '""', position: 'absolute', inset: 0,
          ...patternStyle, opacity: 0.45, pointerEvents: 'none',
        },
        /* верхнє затемнення */
        '&::after': {
          content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '60%',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.45), transparent)',
          pointerEvents: 'none',
        },
      }}
    >
      {/* ---------- заголовок ---------- */}
      <Box sx={{ textAlign: 'center', mt: 2, px: 1, zIndex: 1 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: '"Quicksand", sans-serif',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#fff',
            textShadow: '0 2px 4px rgba(0,0,0,0.6)',
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
            mb: subtitle ? 1.2 : 2,
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: '"Quicksand", sans-serif',
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.85)',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              fontSize: '0.9rem',
              mb: 2,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* ---------- низ обкладинки ---------- */}
      <Box
        sx={{
          zIndex: 1, p: 2, pt: 3,
          background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)',
          borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Quicksand", sans-serif',
            color: '#fff', textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.6)',
            fontSize: '1rem',
          }}
        >
          {author}
        </Typography>

        {(publisher || year) && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
            {year && (
              <Typography
                variant="body2"
                sx={{
                  px: 1, py: 0.5, borderRadius: 8,
                  background: 'rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '0.75rem',
                }}
              >
                {year}
              </Typography>
            )}
            {publisher && (
              <Typography
                variant="body2"
                sx={{
                  px: 1, py: 0.5, borderRadius: 8,
                  background: 'rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '0.75rem',
                }}
              >
                {publisher}{publisherLocation ? `, ${publisherLocation}` : ''}
              </Typography>
            )}
          </Box>
        )}
      </Box>

    </Paper>
  );
};

export default BookCover;
