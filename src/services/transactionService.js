import { transactionApi } from './api';

export const transactionService = {
  getTransactions: async () => {
    const response = await transactionApi.get('/transactions');
    return response.data;
  },

  createTransaction: async (transactionData) => {
    const response = await transactionApi.post('/transactions', transactionData);
    return response.data;
  }
}; 