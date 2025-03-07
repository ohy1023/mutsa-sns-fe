import privateApi from '@/utils/privateApi';
import publicApi from '@/utils/publicApi';
import { Response, Page } from '@/types/common';
import {
  Comment,
  CommentCreateRequest,
  CommentUpdateRequest,
} from '@/types/comment';

// 특정 게시글의 댓글 목록 조회
export const getComments = async (
  postId: number,
  page: number = 0,
): Promise<Page<Comment>> => {
  const response = await publicApi.get<Response<Page<Comment>>>(
    `/posts/${postId}/comments`,
    {
      params: { page, size: 10, sort: 'registeredAt,DESC' },
    },
  );
  return response.data.result;
};

// 댓글 작성
export const postComment = async (
  postId: number,
  commentData: CommentCreateRequest,
): Promise<void> => {
  await privateApi.post(`/posts/${postId}/comments`, commentData);
};

// 댓글 수정
export const updateComment = async (
  postId: number,
  commentId: number,
  commentData: CommentUpdateRequest,
): Promise<void> => {
  await privateApi.put(`/posts/${postId}/comments/${commentId}`, commentData);
};

// 댓글 삭제
export const deleteComment = async (commentId: number): Promise<void> => {
  await privateApi.delete(`/posts/comments/${commentId}`);
};
