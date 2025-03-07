import publicApi from '@/utils/publicApi';
import privateApiMultipart from '@/utils/privateApiMultipart';
import privateApi from '@/utils/privateApi';
import { PostMediaRequest } from '@/types/post';
import { Response, Page } from '@/types/common';
import { PostDetailResponse, PostSummaryInfoResponse } from '@/types/post';
import mime from 'mime';

export const registerPost = async (
  body: string,
  mediaFiles: PostMediaRequest[],
): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('body', encodeURIComponent(body));

    // 이미지 파일 추가
    mediaFiles.forEach((item, index) => {
      const fileType = mime.getType(item.uri) || 'image/jpeg';
      formData.append('multipartFileList', {
        uri: item.uri,
        type: fileType,
        name: `image-${index}.${mime.getExtension(fileType) || 'jpg'}`,
      } as any);
    });

    // 이미지 순서 추가
    formData.append(
      'multipartFileOrderList',
      JSON.stringify(mediaFiles.map((item) => item.order)),
    );

    // Axios 요청 (Spring과 완벽 호환)
    await privateApiMultipart.post('/posts', formData);

    console.log('게시글 업로드 성공!');
  } catch (error) {
    console.error('게시글 업로드 중 오류:', error);
    throw new Error('게시글 업로드 중 오류 발생');
  }
};

// 게시글 삭제
export const deletePost = async (postId: number): Promise<void> => {
  await privateApi.delete(`/posts/${postId}`);
};

// 포스트 상세 조회
export const getPostDetail = async (
  postId: number,
): Promise<PostDetailResponse> => {
  const response = await privateApi.get<Response<PostDetailResponse>>(
    `/posts/${postId}`,
  );
  return response.data.result;
};

// 특정 유저의 게시글 요약 목록
export const getUserPosts = async (
  userName: string,
  page: number,
): Promise<Page<PostSummaryInfoResponse>> => {
  const response = await publicApi.get<Response<Page<PostSummaryInfoResponse>>>(
    `/posts/info/${userName}`,
    {
      params: { page, size: 9 },
    },
  );
  return response.data.result;
};

// 나의 게시글 요약 목록
export const getMyPosts = async (
  page: number,
): Promise<Page<PostSummaryInfoResponse>> => {
  const response = await privateApi.get<
    Response<Page<PostSummaryInfoResponse>>
  >(`/posts/my`, {
    params: { page, size: 9 },
  });
  return response.data.result;
};

// 게시글 좋아요
export const addLike = async (postId: number): Promise<void> => {
  await privateApi.post(`/posts/${postId}/likes`);
};

// 게시글 좋아요 취소
export const removeLike = async (postId: number): Promise<void> => {
  await privateApi.delete(`/posts/${postId}/likes`);
};

// 내가 팔로우한 사람들의 피드 목록 조회
export const getFollowingFeed = async (
  page: number = 0,
): Promise<Page<PostDetailResponse>> => {
  const response = await privateApi.get<Response<Page<PostDetailResponse>>>(
    '/posts/following',
    {
      params: { page, size: 6, sort: 'registeredAt,DESC' },
    },
  );
  return response.data.result;
};
