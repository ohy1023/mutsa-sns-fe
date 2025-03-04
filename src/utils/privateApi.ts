import axios from 'axios';
import { getToken } from '../utils/authToken'; // 토큰 가져오는 함수
import { API_URL } from '@env';

const privateApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ 요청마다 토큰을 자동으로 추가하는 인터셉터 설정
privateApi.interceptors.request.use(async (config) => {
  const token = await getToken(); // 저장된 JWT 토큰 가져오기
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default privateApi;
