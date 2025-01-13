import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const PortfolioTransactions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log('Component rendered with portfolio ID:', id);

  const fetchTransactions = async () => {
    console.log('Fetching transactions for portfolio:', id);
    try {
      setLoading(true);
      const url = `http://localhost:8082/v1/transactions/portfolio/${id}/transactions`;
      console.log('Fetching from URL:', url);

      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await response.json();
      console.log('Received transactions data:', data);
      setTransactions(data);
    } catch (error) {
      console.error('Error in fetchTransactions:', error);
      console.error('Full error details:', {
        message: error.message,
        stack: error.stack
      });
    } finally {
      setLoading(false);
      console.log('Loading state set to false');
    }
  };

  useEffect(() => {
    console.log('useEffect triggered with id:', id);
    fetchTransactions();
  }, [id]);

  const formatDateTime = (dateString) => {
    console.log('Formatting date string:', dateString);
    return new Date(dateString).toLocaleString();
  };

  const isIncoming = (transaction) => {
    const result = transaction.receiverId === parseInt(id);
    console.log('Checking if transaction is incoming:', {
      transactionId: transaction.id,
      receiverId: transaction.receiverId,
      portfolioId: parseInt(id),
      isIncoming: result
    });
    return result;
  };

  if (loading) {
    console.log('Rendering loading state');
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  console.log('Rendering transactions table with data:', transactions);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/portfolio/${id}`)}
        >
          Back to Portfolio
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Transaction History</Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date & Time</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => {
                console.log('Rendering transaction:', transaction);
                return (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {formatDateTime(transaction.createdAt)}
                    </TableCell>
                    <TableCell>
                      {transaction.description}
                    </TableCell>
                    <TableCell align="right" sx={{ 
                      color: isIncoming(transaction) ? 'success.main' : 'error.main'
                    }}>
                      {isIncoming(transaction) ? '+' : '-'}
                      ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      {transaction.status}
                    </TableCell>
                  </TableRow>
                );
              })}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default PortfolioTransactions; 