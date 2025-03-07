import publicApi from '@/utils/publicApi';
import privateApi from '@/utils/privateApi';
import privateApiMultipart from '@/utils/privateApiMultipart';
import { Response, ErrorResponse } from '@/types/common';
import { AxiosError } from 'axios';
import {
  UserJoinRequest,
  UserJoinResponse,
  LoginRequest,
  LoginResult,
  UserDetailResponse,
} from '@/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const registerUser = async (
  userData: UserJoinRequest,
): Promise<UserJoinResponse> => {
  try {
    const response = await publicApi.post<Response<UserJoinResponse>>(
      '/users/join',
      userData,
    );
    return response.data.result;
  } catch (error) {
    if (error instanceof AxiosError) {
      const serverError: ErrorResponse | undefined = error.response?.data;
      if (serverError && serverError.resultCode === 'ERROR') {
        throw new Error(
          `${serverError.result.errorCode}: ${serverError.result.message}`,
        );
      }
    }
    throw new Error('회원가입 중 오류가 발생했습니다.');
  }
};

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

// 회원 정보 수정
export const changeUserInfo = async (
  newNickName: string,
  imageUri?: string | null,
): Promise<void> => {
  const formData = new FormData();

  // 프로필 이미지 추가 (선택적)
  if (imageUri) {
    const fileName = imageUri.split('/').pop(); // 파일 이름 추출
    const fileType = fileName?.split('.').pop() || 'jpeg'; // 확장자 추출 (기본값 jpeg)

    formData.append('multipartFile', {
      uri: imageUri,
      name: fileName,
      type: `image/${fileType}`,
    } as any);
  }

  formData.append('newNickName', encodeURIComponent(newNickName));

  // API 요청 (Multipart로 전송)
  await privateApiMultipart.patch('/users/info', formData);
};

// 특정 유저 정보 조회
export const getUserInfo = async (
  userName: string,
): Promise<UserDetailResponse> => {
  const response = await publicApi.get<Response<UserDetailResponse>>(
    `/users/${userName}`,
  );
  return response.data.result;
};

export const getMyInfo = async (): Promise<UserDetailResponse> => {
  const response = await privateApi.get<Response<UserDetailResponse>>(
    `/users/info`,
  );
  return response.data.result;
};
