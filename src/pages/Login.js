import React, { useState } from 'react';
import { 
  Box,
  TextField,
  Button,
  Typography, 
  Container, 
  Paper,
  Alert 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: 'john_doe',
    password: 'secret'
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await userApi.post('/users/login', formData);
      console.log('Login response:', response);
      console.log('User data:', response.data);
      
      // Store minimal user data
      localStorage.setItem('userId', response.data.id);
      localStorage.setItem('userName', response.data.firstName);
      
      console.log('Stored user ID:', localStorage.getItem('userId'));
      console.log('Stored user name:', localStorage.getItem('userName'));
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error details:', error);
      setError('Invalid username or password');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h5" align="center">
            Sign in
          </Typography>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 