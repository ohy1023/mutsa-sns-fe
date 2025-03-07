export interface PostMediaRequest {
  uri: string; // 이미지 미리보기를 위한 `uri`
  order: number; // 이미지 순서
}

export interface PostMediaDto {
  mediaUrl: string;
  mediaOrder: number;
}

export interface PostDetailResponse {
  postId: number;
  body: string;
  userName: string;
  nickName: string;
  registeredAt: string;
  likeCnt: number;
  userImg: string;
  commentCnt: number;
  isOwner: boolean;
  isLiked: boolean;
  postMediaDtoList: PostMediaDto[];
}

export interface PostSummaryInfoResponse {
  postId: number;
  postThumbnailUrl: string;
  registeredAt: Date;
}
