import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:53759';

export const api = axios.create({
  baseURL: API_BASE_URL,
});
