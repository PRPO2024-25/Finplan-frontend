import axios from 'axios';

const PORTFOLIO_API_URL = 'http://localhost:8080/v1/portfolios';

export const portfolioApi = axios.create({
  baseURL: PORTFOLIO_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

export const getPortfoliosByUserId = async (userId) => {
  try {
    console.log('Fetching portfolios for user:', userId);
    const response = await portfolioApi.get(`/user/${userId}`);
    console.log('Portfolios response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    throw error;
  }
}; 