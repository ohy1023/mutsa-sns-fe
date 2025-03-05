export interface UserJoinRequest {
  userName: string;
  nickName: string;
  password: string;
}

export interface UserJoinResponse {
  userId: number;
  userName: string;
  nickName: string;
}
