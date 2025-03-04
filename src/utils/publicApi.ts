import axios from 'axios';
import { API_URL } from '@env';

const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default publicApi;
