import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  CircularProgress, 
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import { getPortfoliosByUserId } from '../services/portfolioService';

const PortfolioDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openDepositDialog, setOpenDepositDialog] = useState(false);
  const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false);
  const [amount, setAmount] = useState('');
  const [openAddStockDialog, setOpenAddStockDialog] = useState(false);
  const [newStock, setNewStock] = useState({
    symbol: '',
    quantity: '',
    purchasePrice: ''
  });

  const fetchPortfolioDetails = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const portfolios = await getPortfoliosByUserId(userId);
      const currentPortfolio = portfolios.find(p => p.id === parseInt(id));
      
      if (!currentPortfolio) {
        throw new Error('Portfolio not found');
      }

      setPortfolio(currentPortfolio);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching portfolio details:', err);
      setError('Failed to load portfolio details');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioDetails();
  }, [id]);

  const updateStockPrices = async () => {
    try {
      setUpdating(true);
      const response = await fetch('http://localhost:8080/v1/portfolios/stocks/update-prices', {
        method: 'PUT',
      });
      
      if (!response.ok) {
        throw new Error('Failed to update stock prices');
      }

      const result = await response.json();
      setSnackbar({
        open: true,
        message: `Updated ${result.updatedStocks} stocks successfully`,
        severity: 'success'
      });
      
      // Refresh the portfolio data
      await fetchPortfolioDetails();
    } catch (err) {
      console.error('Error updating stock prices:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update stock prices',
        severity: 'error'
      });
    } finally {
      setUpdating(false);
    }
  };

  const calculateTotalValue = () => {
    if (!portfolio) return 0;
    const stocksValue = portfolio.stocks.reduce((total, stock) => {
      return total + (stock.currentPrice * stock.quantity);
    }, 0);
    return stocksValue + portfolio.cashBalance;
  };

  const handleDeposit = async () => {
    try {
        const response = await fetch(`http://localhost:8080/v1/portfolios/${id}/deposit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount: parseFloat(amount) })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to deposit funds');
        }

        setSnackbar({
            open: true,
            message: `Successfully deposited $${amount}`,
            severity: 'success'
        });
        
        await fetchPortfolioDetails();
        setOpenDepositDialog(false);
        setAmount('');
    } catch (err) {
        setSnackbar({
            open: true,
            message: err.message,
            severity: 'error'
        });
    }
  };

  const handleWithdraw = async () => {
    try {
        const response = await fetch(`http://localhost:8080/v1/portfolios/${id}/withdraw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount: parseFloat(amount) })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to withdraw funds');
        }

        setSnackbar({
            open: true,
            message: `Successfully withdrew $${amount}`,
            severity: 'success'
        });
        
        await fetchPortfolioDetails();
        setOpenWithdrawDialog(false);
        setAmount('');
    } catch (err) {
        setSnackbar({
            open: true,
            message: err.message,
            severity: 'error'
        });
    }
  };

  const handleAddStock = async () => {
    try {
      console.log('Adding stock to portfolio:', id);
      
      // Build URL with query parameters
      const url = new URL(`http://localhost:8080/v1/portfolios/${id}/stocks`);
      url.searchParams.append('ticker', newStock.symbol.toUpperCase());
      url.searchParams.append('quantity', newStock.quantity);
      url.searchParams.append('purchasePrice', newStock.purchasePrice);

      console.log('Sending request to:', url.toString());

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add stock');
      }

      const result = await response.json();
      console.log('Stock added successfully:', result);

      setSnackbar({
        open: true,
        message: `Successfully added ${newStock.quantity} shares of ${newStock.symbol}`,
        severity: 'success'
      });

      // Reset form and close dialog
      setNewStock({ symbol: '', quantity: '', purchasePrice: '' });
      setOpenAddStockDialog(false);
      
      // Refresh portfolio data
      await fetchPortfolioDetails();
    } catch (err) {
      console.error('Error adding stock:', err);
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Container>
      <Typography color="error" variant="h6">{error}</Typography>
    </Container>
  );

  if (!portfolio) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
        <Box>
          <Button
            onClick={() => navigate(`/portfolio/${id}/transactions`)}
            sx={{ mr: 2 }}
          >
            View Transactions
          </Button>
          <Button
            startIcon={<RefreshIcon />}
            onClick={updateStockPrices}
            disabled={updating}
            variant="contained"
          >
            {updating ? 'Updating...' : 'Update Prices'}
          </Button>
          <Button
            startIcon={<AddIcon />}
            onClick={() => setOpenAddStockDialog(true)}
            variant="contained"
            color="primary"
            sx={{ mr: 2 }}
          >
            Add Stock
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Portfolio Summary */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              Portfolio #{portfolio.id}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Cash Balance
                  </Typography>
                  <Typography variant="h6">
                    ${portfolio.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => setOpenDepositDialog(true)}
                      sx={{ mr: 1 }}
                    >
                      Deposit
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => setOpenWithdrawDialog(true)}
                      color="secondary"
                    >
                      Withdraw
                    </Button>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Total Stock Value
                  </Typography>
                  <Typography variant="h6">
                    ${(calculateTotalValue() - portfolio.cashBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Total Portfolio Value
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ${calculateTotalValue().toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Stocks Table */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Stock</TableCell>
                  <TableCell>Symbol</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Purchase Price</TableCell>
                  <TableCell align="right">Current Price</TableCell>
                  <TableCell align="right">Total Value</TableCell>
                  <TableCell align="right">Profit/Loss</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {portfolio.stocks.map((stock) => {
                  const totalValue = stock.currentPrice * stock.quantity;
                  const profitLoss = (stock.currentPrice - stock.purchasePrice) * stock.quantity;
                  const profitLossPercent = ((stock.currentPrice - stock.purchasePrice) / stock.purchasePrice) * 100;

                  return (
                    <TableRow key={stock.id}>
                      <TableCell>{stock.name}</TableCell>
                      <TableCell>{stock.symbol}</TableCell>
                      <TableCell align="right">{stock.quantity}</TableCell>
                      <TableCell align="right">
                        ${stock.purchasePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        ${stock.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell 
                        align="right"
                        sx={{ 
                          color: profitLoss >= 0 ? 'success.main' : 'error.main'
                        }}
                      >
                        ${profitLoss.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        <br />
                        <Typography variant="caption">
                          ({profitLossPercent.toFixed(2)}%)
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog open={openDepositDialog} onClose={() => setOpenDepositDialog(false)}>
        <DialogTitle>Deposit Funds</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            InputProps={{
              startAdornment: <span>$</span>,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDepositDialog(false)}>Cancel</Button>
          <Button onClick={handleDeposit} variant="contained">Deposit</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openWithdrawDialog} onClose={() => setOpenWithdrawDialog(false)}>
        <DialogTitle>Withdraw Funds</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            InputProps={{
              startAdornment: <span>$</span>,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWithdrawDialog(false)}>Cancel</Button>
          <Button onClick={handleWithdraw} variant="contained" color="secondary">Withdraw</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAddStockDialog} onClose={() => setOpenAddStockDialog(false)}>
        <DialogTitle>Add Stock</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Stock Symbol"
            fullWidth
            value={newStock.symbol}
            onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Quantity"
            type="number"
            fullWidth
            value={newStock.quantity}
            onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Purchase Price"
            type="number"
            fullWidth
            value={newStock.purchasePrice}
            onChange={(e) => setNewStock({ ...newStock, purchasePrice: e.target.value })}
            InputProps={{
              startAdornment: <span>$</span>,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddStockDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddStock} 
            variant="contained"
            disabled={!newStock.symbol || !newStock.quantity || !newStock.purchasePrice}
          >
            Add Stock
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PortfolioDetail; 