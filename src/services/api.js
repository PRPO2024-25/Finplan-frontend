import axios from 'axios';

const createApi = (baseURL) => {  
  const api = axios.create({ baseURL });
  
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return api;
};

export const portfolioApi = createApi('http://localhost:8080/v1');
export const userApi = createApi('http://localhost:8081/v1');
export const transactionApi = createApi('http://localhost:8082/v1'); 