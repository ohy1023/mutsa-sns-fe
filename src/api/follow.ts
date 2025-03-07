import { Response, Page } from '@/types/common';
import { UserInfoResponse } from '@/types/user';
import privateApi from '@/utils/privateApi';

// 해당 유저 팔로우 유뮤 조회
export const followCheck = async (targetUserName: string): Promise<boolean> => {
  try {
    const response = await privateApi.get<boolean>(
      `/users/follow-check/${targetUserName}`,
    );
    return response.data;
  } catch (error) {
    console.error('팔로우 여부 확인 실패:', error);
    return false; // 기본적으로 팔로우 안 한 것으로 처리
  }
};

// 특정 유저가 팔로우한 유저 목록 조회
export const getFollowingUsers = async (
  userName: string,
  page: number,
): Promise<Page<UserInfoResponse>> => {
  const response = await privateApi.get<Response<Page<UserInfoResponse>>>(
    `/users/${userName}/following`,
    {
      params: { page },
    },
  );
  return response.data.result;
};

// 특정 유저를 팔로우한 유저 목록 조회
export const getFollowers = async (
  userName: string,
  page: number,
): Promise<Page<UserInfoResponse>> => {
  const response = await privateApi.get<Response<Page<UserInfoResponse>>>(
    `/users/${userName}/followers`,
    {
      params: { page },
    },
  );
  return response.data.result;
};

// 특정 유저 팔로우 요청
export const followUser = async (targetUserName: string): Promise<void> => {
  try {
    await privateApi.post(`/users/follow/${targetUserName}`);
  } catch (error) {
    console.error('팔로우 요청 실패:', error);
    throw new Error('팔로우 요청 중 오류가 발생했습니다.');
  }
};

// 특정 유저 언팔로우 요청
export const unfollowUser = async (targetUserName: string): Promise<void> => {
  try {
    await privateApi.delete(`/users/unfollow/${targetUserName}`);
  } catch (error) {
    console.error('언팔로우 요청 실패:', error);
    throw new Error('언팔로우 요청 중 오류가 발생했습니다.');
  }
};

// 내가 팔로우한 유저 목록 조회
export const getMyFollowing = async (
  page: number = 0,
): Promise<Page<UserInfoResponse>> => {
  const response = await privateApi.get<Response<Page<UserInfoResponse>>>(
    '/users/my-following',
    {
      params: { page, size: 20 },
    },
  );
  return response.data.result;
};

// 나를 팔로우한 유저 목록 조회
export const getMyFollowers = async (
  page: number = 0,
): Promise<Page<UserInfoResponse>> => {
  const response = await privateApi.get<Response<Page<UserInfoResponse>>>(
    '/users/my-followers',
    {
      params: { page, size: 20 },
    },
  );
  return response.data.result;
};
