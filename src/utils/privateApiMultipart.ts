import axios from 'axios';
import { getToken } from '../utils/authToken'; // 저장된 JWT 토큰 가져오는 함수
import { API_URL } from '@env';

const privateApiMultipart = axios.create({
  baseURL: API_URL,
});

// 요청마다 `Authorization` 헤더 추가 + 멀티파트 요청 자동 처리
privateApiMultipart.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 멀티파트 요청 시 `Content-Type` 자동 설정
  config.headers['Content-Type'] = 'multipart/form-data';

  return config;
});

export default privateApiMultipart;
