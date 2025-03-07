export interface Comment {
  id: number;
  comment: string;
  userName: string;
  userImg: string;
  postId: number;
  registeredAt: string;
}

export interface CommentCreateRequest {
  comment: string;
}

export interface CommentUpdateRequest {
  comment: string;
}
