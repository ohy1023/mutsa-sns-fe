export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResult {
  jwt: string;
}
