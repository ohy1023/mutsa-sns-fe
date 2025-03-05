export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResult {
  jwt: string;
}

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

export interface UserDetailResponse {
  userName: string;
  nickName: string;
  userImg: string;
  followingCount: number;
  followerCount: number;
}

export interface UserInfoResponse {
  userId: number;
  userName: string;
  nickName: string;
  userImg: string;
}
