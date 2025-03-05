import { LoginRequest, LoginResult } from '@/types/login';
import publicApi from '@/utils/publicApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Response, ErrorResponse } from '@/types/common';
import { AxiosError } from 'axios';

export const loginUser = async (credentials: LoginRequest): Promise<string> => {
  try {
    const response = await publicApi.post<Response<LoginResult>>(
      '/users/login',
      credentials,
    );
    const token = response.data.result.jwt;

    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('userName', credentials.userName);

    return token;
  } catch (error) {
    if (error instanceof AxiosError) {
      // 서버에서 보낸 에러 응답을 `ErrorResponse` 타입으로 처리
      const serverError: ErrorResponse | undefined = error.response?.data;
      if (serverError && serverError.resultCode === 'ERROR') {
        throw new Error(
          `${serverError.result.errorCode}: ${serverError.result.message}`,
        );
      }
    }
    throw new Error('알 수 없는 오류가 발생했습니다.');
  }
};
