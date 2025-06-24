import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    secretKey: ''
  });
  const [error, setError] = useState('');
  const [secretKeyError, setSecretKeyError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear secret key error when user types in the field
    if (name === 'secretKey') {
      setSecretKeyError('');
    }
  };

  const handleRoleChange = (e: SelectChangeEvent) => {
    setFormData((prev) => ({
      ...prev,
      role: e.target.value as 'user' | 'admin',
    }));
    setSecretKeyError('');
  };

  const validateAdminSecretKey = (): boolean => {
    // This should be a strong validation algorithm in a real application
    // For demonstration purposes, we're using a simple check
    const correctSecretKey = 'twin123'; // In real app, this would not be hardcoded

    if (formData.role === 'ADMIN' && formData.secretKey !== correctSecretKey) {
      setSecretKeyError('Invalid secret key for admin registration');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.role === 'admin' && !validateAdminSecretKey()) {
      return;
    }
    try {
      // Приводимо роль до нижнього регістру перед відправкою
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role.toLowerCase() as 'user' | 'admin',
        ...(formData.role === 'admin' && { secretKey: formData.secretKey })
      };
      console.log('Register payload:', payload);
      const response = await authService.register(payload);
      console.log('Register response:', response);
      if (response.token) {
        console.log('Token received:', response.token);
        const userData = authService.getUser();
        console.log('User data from localStorage:', userData);
        if (userData) {
          login(userData);
        }
      } else {
        console.warn('No token in response:', response);
      }
      navigate('/books');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
      <Container maxWidth="sm">
  <Box
    sx={{
      mt: 10,
      backdropFilter: 'blur(10px)',
      background: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 4,
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      p: 4,
      color: '#fff',
      border: '1px solid rgba(255, 255, 255, 0.18)',
    }}
  >
    <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: '#e3f2fd' }}>
      Реєстрація
    </Typography>

    {error && (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )}

    <form onSubmit={handleSubmit}>
      <TextField
        fullWidth
        label="Ім'я"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        margin="normal"
        required
        InputLabelProps={{ style: { color: '#90caf9' } }}
        InputProps={{
          style: { color: 'white' },
        }}
      />
      <TextField
        fullWidth
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        margin="normal"
        required
        InputLabelProps={{ style: { color: '#90caf9' } }}
        InputProps={{
          style: { color: 'white' },
        }}
      />
      <TextField
        fullWidth
        label="Пароль"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleInputChange}
        margin="normal"
        required
        InputLabelProps={{ style: { color: '#90caf9' } }}
        InputProps={{
          style: { color: 'white' },
        }}
      />
      <TextField
        fullWidth
        label="Повторіть пароль"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleInputChange}
        margin="normal"
        required
        InputLabelProps={{ style: { color: '#90caf9' } }}
        InputProps={{
          style: { color: 'white' },
        }}
      />

      <FormControl fullWidth margin="normal">
  <InputLabel id="role-label" sx={{ color: '#90caf9' }}>Роль</InputLabel>
  <Select
    labelId="role-label"
    name="role"
    value={formData.role}
    label="Роль"
    onChange={handleRoleChange}
    sx={{
      color: 'white',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#90caf9',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#bbdefb',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#bbdefb',
      },
    }}
    MenuProps={{
      PaperProps: {
        sx: {
          backgroundColor: '#0a1929',
          color: 'white',
        },
      },
    }}
  >
    <MenuItem value="USER">Користувач</MenuItem>
    <MenuItem value="ADMIN">Адмін</MenuItem>
  </Select>
</FormControl>


      {formData.role === 'ADMIN' && (
  <TextField
    fullWidth
    label="Секретний ключ"
    name="secretKey"
    type="password"
    value={formData.secretKey}
    onChange={handleInputChange}
    margin="normal"
    required
    error={!!secretKeyError}
    helperText={secretKeyError}
    InputLabelProps={{ style: { color: '#90caf9' } }}
    InputProps={{
      style: { color: 'white' },
    }}
  />
)}


      <Button
  type="submit"
  fullWidth
  variant="contained"
  sx={{
    mt: 3,
    mb: 2,
    borderRadius: '30px',
    fontWeight: 700,
    px: 3,
  }}
>
  Зареєструватись
</Button>


      <Typography align="center" sx={{ color: '#bbdefb' }}>
        Don't have an account?{' '}
        <Link to="/login" style={{ color: '#90caf9', textDecoration: 'none' }}>
          Login
        </Link>
      </Typography>
    </form>
  </Box>
</Container>

  );
};

export default Register;
