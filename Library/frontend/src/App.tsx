import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, Container, Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import AppRoutes from './routes';
import theme from './theme';
import './App.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';



const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <div className="App">
            <Navbar />
            <Box
              component="main"
              sx={{
                pt: 10,
                pb: 6,
                minHeight: 'calc(100vh - 64px)',
                position: 'relative',
                zIndex: 1,
                marginTop: '64px', // Додаємо відступ зверху для фіксованого хедера
              }}
            >
              <Container maxWidth="lg" sx={{ position: 'relative' }}>
                <AppRoutes />
              </Container>
            </Box>
            {/* Decorative elements */}
            <Box
              sx={{
                position: 'fixed',
                top: '20%',
                left: '-10%',
                width: '20vw',
                height: '20vw',
                borderRadius: '50%',
        
                zIndex: 0,
                pointerEvents: 'none',
              }}
            />
            <Box
              sx={{
                position: 'fixed',
                bottom: '10%',
                right: '-5%',
                width: '15vw',
                height: '15vw',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%)',
                zIndex: 0,
                pointerEvents: 'none',
              }}
            />
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
