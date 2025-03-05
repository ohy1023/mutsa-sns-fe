import publicApi from '@/utils/publicApi';
import { Response, ErrorResponse } from '@/types/common';
import { AxiosError } from 'axios';
import { UserJoinRequest, UserJoinResponse } from '@/types/register';

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
