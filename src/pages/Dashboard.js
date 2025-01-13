import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Box,
  Button,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import { getPortfoliosByUserId } from '../services/portfolioService';
import CreatePortfolio from './CreatePortfolio';

const Dashboard = () => {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userId = localStorage.getItem('userId');
        console.log('Fetching user details for ID:', userId);
        
        const response = await fetch(`http://localhost:8081/v1/users/${userId}`);
        console.log('User API Response:', response);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }
        
        const userData = await response.json();
        console.log('User data received:', userData);
        
        if (!userData.firstName) {
          throw new Error('No name found in user data');
        }
        
        setUsername(userData.firstName || 'Unknown User');
      } catch (error) {
        console.error('Error fetching user details:', error);
        setUsername('Unknown User');
      }
    };

    fetchUserDetails();
    fetchPortfolios();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const fetchPortfolios = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const userPortfolios = await getPortfoliosByUserId(userId);
      setPortfolios(userPortfolios);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      setLoading(false);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Finance Portfolio
          </Typography>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            Welcome, {username}
          </Typography>
          <IconButton
            color="inherit"
            onClick={handleLogout}
            title="Logout"
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4">Your Portfolios</Typography>
          <Button 
            variant="contained" 
            onClick={() => setOpenCreateDialog(true)}
          >
            Create New Portfolio
          </Button>
        </Box>

        <Grid container spacing={3}>
          {portfolios.map((portfolio) => (
            <Grid item xs={12} md={6} lg={4} key={portfolio.id}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                }}
                onClick={() => navigate(`/portfolio/${portfolio.id}`)}
              >
                <Typography variant="h6" gutterBottom>
                  Portfolio #{portfolio.id}
                </Typography>
                <Typography color="text.secondary">
                  Cash Balance: ${portfolio.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Typography>
                <Typography color="text.secondary">
                  Stocks: {portfolio.stocks?.length || 0}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <CreatePortfolio 
          open={openCreateDialog} 
          onClose={() => setOpenCreateDialog(false)} 
        />
      </Container>
    </>
  );
};

export default Dashboard;