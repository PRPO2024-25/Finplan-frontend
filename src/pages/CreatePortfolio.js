import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

const CreatePortfolio = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCreatePortfolio = async () => {
    try {
      console.log('Creating new portfolio...');
      setLoading(true);
      
      const userId = localStorage.getItem('userId');
      console.log('Using userId:', userId);

      const response = await fetch(`http://localhost:8080/v1/portfolios/create?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create portfolio');
      }

      const portfolio = await response.json();
      console.log('Created portfolio:', portfolio);

      onClose();
      navigate(`/portfolio/${portfolio.id}`);
    } catch (error) {
      console.error('Error creating portfolio:', error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create New Portfolio</DialogTitle>
      <DialogContent>
        <Typography>
          This will create a new portfolio for your account. You can add stocks and manage your investments after creation.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleCreatePortfolio} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Portfolio'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePortfolio; 