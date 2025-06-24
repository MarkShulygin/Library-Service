import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',     // Синій акцент (кнопки, активні елементи)
      contrastText: '#ffffff', // Текст на синьому тлі — білий
    },
    secondary: {
      main: '#1976d2',     // Білий як другорядний (наприклад, тло кнопок)
      contrastText: '#ffffff', // Синій текст на білому
    },
    background: {
      default: '#ffffff',  // Основний фон сторінки
      paper: 'rgba(1, 28, 68, 0.47)',    // Фон карточок і блоків
    },
    text: {
      primary: '#ffffff',  // Основний текст — майже чорний
      secondary: '#ffffff', // Підписи / допоміжний текст
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#f57c00',
    },
    info: {
      main: '#0288d1',
    },
    success: {
      main: '#388e3c',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", sans-serif',
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 20px',
          textTransform: 'none',
        },
        containedPrimary: {
          backgroundColor: '#1976d2',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#115293',
          },
        },
        outlinedPrimary: {
          border: '2px solid #1976d2',
          color: '#1976d2',
          backgroundColor: '#fff',
          '&:hover': {
            backgroundColor: '#e3f2fd',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1976d2',
          color: '#fff',
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#ccc',
            },
            '&:hover fieldset': {
              borderColor: '#1976d2',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1976d2',
            },
          },
        },
      },
    },
  },
});

export default theme;
