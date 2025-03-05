import publicApi from '@/utils/publicApi';
import { Page, Response, ErrorResponse } from '@/types/common';
import { UserInfoResponse } from '@/types/user';
import { AxiosError } from 'axios';

export const fetchUsers = async (
  query: string,
  page: number,
): Promise<Page<UserInfoResponse>> => {
  try {
    const response = await publicApi.get<Response<Page<UserInfoResponse>>>(
      '/users/search',
      {
        params: { keyword: query, page, size: 20 },
      },
    );

    return response.data.result;
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
