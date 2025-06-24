import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  useMediaQuery,
  useTheme,
  Fade,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import PersonIcon from '@mui/icons-material/Person';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    try {
      logout();
      handleUserMenuClose();
      setMobileMenuOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const navItems = [
    { label: 'Головна', path: '/' },
    { label: 'Моя бібліотека', path: '/my-books', requiresAuth: true },
  ];

const renderUserSection = () => {
  if (!isMobile) {
    if (isAuthenticated) {
      return (
        <Box sx={{ ml: 'auto' }}>
          <Button
            variant="outlined"
            color="error"
            onClick={handleLogout}
            sx={{
              borderRadius: '30px',
              fontWeight: 600,
              px: 3,
              color: 'white',
              borderColor: '#f44336',
              '&:hover': {
                backgroundColor: '#f44336',
                color: '#fff',
              },
            }}
          >
            Вийти
          </Button>
        </Box>
      );
    } else {
      return (
        <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
          <Button
            onClick={() => navigate('/login')}
            sx={{
              px: 3,
              py: 1.2,
              fontWeight: 600,
              borderRadius: '30px',
              background: 'rgba(3, 172, 250, 0.72)',
              color: 'white',
              marginRight: '5px',
              '&:hover': {
                background: 'rgba(11, 107, 151, 0.3)',
              },
            }}
          >
            Увійти
          </Button>
          <Button
            onClick={() => navigate('/register')}
            sx={{
              px: 3,
              py: 1.2,
              fontWeight: 600,
              borderRadius: '30px',
              background: 'rgba(3, 172, 250, 0.72)',
              color: 'white',
              '&:hover': {
                background: 'rgba(11, 107, 151, 0.3)',
              },
            }}
          >
            Реєстрація
          </Button>
        </Box>
      );
    }
  }
  return null;
};

  return (
    <AppBar
      position="fixed"
      elevation={scrolled ? 4 : 0}
      sx={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.3)' : 'none',
        borderBottom: scrolled ? 'none' : '1px solid rgba(79, 195, 247, 0.2)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: '100%',
        top: 0,
      }}
    >
      <Toolbar sx={{ position: 'relative', minHeight: 64 }}>
  {/* Ліва секція — меню навігації */}
{!isMobile && (
  <>
    {/* Ліва частина — тільки навігація */}
    <Box sx={{ display: 'flex', gap: 1 }}>
      {navItems.map((item) => {
        if (item.requiresAuth && !isAuthenticated) return null;
        return (
          <Button
            key={item.path}
            color="inherit"
            onClick={() => navigate(item.path)}
            sx={{
              color: '#e1f5fe',
              fontWeight: 600,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: '50%',
                width: '0%',
                height: '2px',
                bgcolor: '#29b6f6',
                transform: 'translateX(-50%)',
                transition: 'all 0.3s ease',
              },
              '&:hover::after': {
                width: '70%',
              },
              '&:hover': {
                color: '#29b6f6',
              },
            }}
          >
            {item.label}
          </Button>
        );
      })}
    </Box>

    {/* Права частина — авторизація або профіль */}
    {renderUserSection()}
  </>
)}



  {/* Мобільне меню */}
  {isMobile && (
    <IconButton
      edge="end"
      onClick={handleMobileMenuToggle}
      sx={{
        color: '#4fc3f7',
        ml: 'auto',
        bgcolor: 'rgba(79, 195, 247, 0.15)',
        '&:hover': {
          bgcolor: 'rgba(79, 195, 247, 0.3)',
        },
      }}
    >
    
      <MenuIcon />
    </IconButton>
  )}
    </Toolbar>
    </AppBar>
  );
};

export default Navbar;
