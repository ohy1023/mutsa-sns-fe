import {
  ChatRequestDto,
  ChattingHistoryResponseDto,
  MyChatRoomResponse,
  Message,
  Chat,
} from '@/types/chat';
import privateApi from '@/utils/privateApi';
import { Response, Slice } from '@/types/common';

// 채팅방 생성
export const createChatRoom = async (
  requestDto: ChatRequestDto,
): Promise<Chat> => {
  const response = await privateApi.post<Response<Chat>>(
    '/chatroom',
    requestDto,
  );
  return response.data.result;
};

// 채팅 내역 조회 (페이징 적용)
export const getChatHistory = async (
  roomNo: number,
  page: number = 0,
  size: number = 10,
): Promise<Slice<ChattingHistoryResponseDto>> => {
  const response = await privateApi.get<
    Response<Slice<ChattingHistoryResponseDto>>
  >(`/chatroom/${roomNo}?page=${page}&size=${size}`);
  return response.data.result;
};

// 내가 참여 중인 채팅방 목록 조회 (페이징 적용)
export const getMyChatRooms = async (
  page: number = 0,
  size: number = 10,
): Promise<Slice<MyChatRoomResponse>> => {
  const response = await privateApi.get<Response<Slice<MyChatRoomResponse>>>(
    `/my-chatroom?page=${page}&size=${size}`,
  );
  return response.data.result;
};
// 메시지 전송 (알림 포함)
export const sendChatMessage = async (message: Message): Promise<Message> => {
  const response = await privateApi.post<Response<Message>>(
    '/chatroom/message-alarm-record',
    message,
  );
  return response.data.result;
};
