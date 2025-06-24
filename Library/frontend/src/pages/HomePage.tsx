import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Button,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="xl">
      {/* Section 1: Рекомендації */}

<Box
  sx={{
    p: 4,
    mb: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',  // напівпрозорий чорний фон
    backdropFilter: 'blur(10px)',            // розмиття фону позаду
    WebkitBackdropFilter: 'blur(10px)',      // для Safari
    color: '#e1f5fe',                        // світлий текст для контрасту
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8)',

    margin: '0 auto',
  }}
>
  <Typography
    variant="h3"
    component="h1"
    sx={{
      fontWeight: 'bold',
      mb: 2,
      background: 'rgba(2, 172, 251, 0.98)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}
  >
    Онлайн бібліотека
  </Typography>

  <Typography variant="body1" sx={{ fontSize: '1.2rem', lineHeight: 1.6 }}>
    Наша платформа створена, щоб зробити процес читання максимально комфортним і приємним для вас. Ви можете легко знаходити нові книги, зберігати улюблені видання, створювати власні закладки і отримувати персоналізовані рекомендації, які допоможуть відкривати нові жанри та авторів.
    <br /><br />
    Ми підтримуємо зручний інтерфейс з можливістю налаштувань читання, щоб кожен міг підлаштувати вигляд тексту під свій стиль — збільшення шрифту, зміну кольору фону чи навіть налаштування режиму “нічного читання”. Ваша бібліотека завжди під рукою, а прогрес читання автоматично зберігається.
    <br /><br />
    Приєднуйтесь до нашої спільноти читачів, розширюйте горизонти і насолоджуйтесь кожною сторінкою!
  </Typography>
</Box>
      <Box
        sx={{
          mt: 8,
          mb: 8,
          p: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #1f1f1f 0%, #2e2e2e 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          textAlign: 'center',
          color: '#fff',
          marginTop: '100px',
        }}
      >

        
<Typography variant="h4" fontWeight="bold" gutterBottom>
  Ваші рекомендації
</Typography>

<Typography variant="body1" color="#ccc" gutterBottom>
  На основі вашого прогресу ми підібрали для вас цікаві книги.
</Typography>

{/* Горизонтальний слайдер */}
<Box
  sx={{
    mt: 4,
    display: 'flex',
    overflowX: 'auto',
    gap: 2,
    pb: 2,
    px: 1,
    '&::-webkit-scrollbar': {
      height: '8px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#4fc3f7',
      borderRadius: '4px',
    },
  }}
>
  {[
    'https://static.yakaboo.ua/media/catalog/product/f/7/f75000b8dc78075added890a54f3ab00_cr.jpg',
    'https://static.yakaboo.ua/media/catalog/product/1/1/11_20_513.jpg',
    'https://static.yakaboo.ua/media/catalog/product/3/6/36d71847392d8330dc89cd0a8d5511a8.jpg',
    'https://static.yakaboo.ua/media/catalog/product/c/o/cover_456_107.jpg',
    'https://static.yakaboo.ua/media/catalog/product/8/0/80056121.jpg',
    'https://static.yakaboo.ua/media/catalog/product/1/3/13_25_1.jpg',
  ].map((url, index) => (
    <Box
      key={index}
      sx={{
        minWidth: 150,
        height: 220,
        borderRadius: 2,
        overflow: 'hidden',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        transition: 'transform 0.3s',
        '&:hover': {
          transform: 'scale(1.05)',
        },
      }}
    >
      <img
        src={url}
        alt={`Книга ${index + 1}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    </Box>
  ))}
</Box>

<Button
  variant="contained"
  color="primary"
  onClick={() => navigate('/my-books')}
  sx={{ mt: 4, px: 4, py: 1.5, borderRadius: 6, fontWeight: 'bold' }}
>
  До моєї бібліотеки
</Button>

      </Box>

      {/* Section 2: Опис платформи */}
      <Box
        sx={{
          p: 4,
          textAlign: 'center',
          mb: 6,
        }}
      >

      </Box>
    </Container>
  );
};

export default HomePage;
