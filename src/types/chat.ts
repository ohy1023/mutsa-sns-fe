export interface ChatRequestDto {
  joinUserName: string;
}

export interface Chat {
  chatNo: number;
  createUser: string;
  joinUser: string;
  regDate: string;
}

export interface ChattingHistoryResponseDto {
  userName: string;
  userImg: string;
  chatList: ChatResponseDto[];
}

export interface MyChatRoomResponse {
  chatRoomId: number;
  joinUserName: string;
  joinNickName: string;
  joinUserImg: string;
  notReadMessageCnt: number;
  lastContent: string;
  lastMessageTime: number[];
}

export interface Message {
  id?: string;
  chatNo: number;
  content: string;
  senderName: string;
  sendDate: number;
  readCount: number;
}

export interface ChatResponseDto {
  id: string;
  chatRoomNo: number;
  senderName: string;
  content: string;
  sendDate: number; // Unix timestamp (milliseconds)
  readCount: number;
  isMine: boolean;
}
