import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Client } from '@stomp/stompjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getChatHistory, sendChatMessage } from '@/api/chat';
import { ChatResponseDto, Message } from '@/types/chat';
import { STOMP_URL } from '@env';

export default function ChatRoom() {
  const { chatRoomId } = useLocalSearchParams<{ chatRoomId: string }>();
  const [messages, setMessages] = useState<ChatResponseDto[]>([]);
  const [messageText, setMessageText] = useState<string>('');
  const [userNameState, setUserNameState] = useState<string | null>(null);
  const stompClientRef = useRef<Client | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  useEffect(() => {
    if (!chatRoomId) return;

    // AsyncStorage에서 userName 가져오기
    const fetchUserName = async () => {
      const storedUserName = await AsyncStorage.getItem('userName');
      setUserNameState(storedUserName);
    };
    fetchUserName();

    const fetchHistory = async () => {
      try {
        const response = await getChatHistory(Number(chatRoomId));
        setMessages(response.content.flatMap((chat) => chat.chatList));
      } catch (error) {
        console.error('채팅 내역 불러오기 실패:', error);
      }
    };

    fetchHistory();

    const connectWebSocket = async () => {
      const accessToken = await AsyncStorage.getItem('authToken');
      if (!accessToken) {
        console.error('AccessToken이 없습니다.');
        return;
      }

      const stompClient = new Client({
        brokerURL: `${STOMP_URL}/chat`,
        connectHeaders: {
          Authorization: `Bearer ${accessToken}`,
          chatRoomNo: chatRoomId,
        },
        debug: (msg) => console.log(msg),
        onConnect: () => {
          stompClient.subscribe(
            `/subscribe/${chatRoomId}`,
            (message) => {
              const newMessage: ChatResponseDto = JSON.parse(message.body);
              setMessages((prev) => [...prev, newMessage]);
            },
            { Authorization: `Bearer ${accessToken}` },
          );
        },
        onStompError: (frame) => {
          console.error('STOMP 오류 발생:', frame);
        },
        forceBinaryWSFrames: true,
        appendMissingNULLonIncoming: true,
      });

      stompClient.activate();
      stompClientRef.current = stompClient;
    };

    connectWebSocket();

    return () => {
      leaveChatRoom();
      stompClientRef.current?.deactivate();
    };
  }, [chatRoomId]);

  const leaveChatRoom = async () => {
    const accessToken = await AsyncStorage.getItem('authToken');
    if (!accessToken || !userNameState) return;

    const leaveRequest = {
      chatNo: Number(chatRoomId),
      userName: userNameState,
    };

    if (stompClientRef.current) {
      stompClientRef.current.publish({
        destination: '/publish/chatroom/leave',
        body: JSON.stringify(leaveRequest),
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !stompClientRef.current) return;

    const accessToken = await AsyncStorage.getItem('authToken');
    if (!accessToken) {
      console.error('AccessToken이 없습니다.');
      return;
    }

    const newMessage: Message = {
      chatNo: Number(chatRoomId),
      content: messageText,
      senderName: userNameState || 'Unknown',
      sendDate: Date.now(),
      readCount: 0,
    };

    stompClientRef.current.publish({
      destination: '/publish/message',
      body: JSON.stringify(newMessage),
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    setMessageText('');

    try {
      await sendChatMessage(newMessage);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 p-4">
            {/* 헤더 */}
            <View className="flex-row justify-between items-center pb-4">
              <TouchableOpacity onPress={() => router.push('/myChat')}>
                <Text className="text-lg font-bold">{'← 뒤로가기'}</Text>
              </TouchableOpacity>
            </View>

            {/* 채팅 메시지 목록 */}
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <View
                  className={`p-2 my-1 rounded-lg ${
                    item.senderName === userNameState
                      ? 'bg-blue-500 self-end'
                      : 'bg-gray-300 self-start'
                  }`}
                >
                  <Text className="text-white">{item.content}</Text>
                </View>
              )}
            />

            {/* 메시지 입력창 */}
            <View className="flex-row items-center p-2 border-t">
              <TextInput
                className="flex-1 p-2 border rounded-md"
                placeholder="메시지를 입력하세요"
                value={messageText}
                onChangeText={setMessageText}
                onFocus={() =>
                  flatListRef.current?.scrollToEnd({ animated: true })
                }
              />
              <TouchableOpacity
                onPress={handleSendMessage}
                className="p-2 bg-blue-500 rounded-md ml-2"
              >
                <Text className="text-white">전송</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
