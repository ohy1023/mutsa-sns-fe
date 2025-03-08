import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getMyChatRooms } from '@/api/chat';
import { MyChatRoomResponse } from '@/types/chat';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyChat() {
  const [chatRooms, setChatRooms] = useState<MyChatRoomResponse[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const router = useRouter();

  /** 채팅방 목록 불러오기 */
  const fetchChatRooms = async () => {
    if (loading || !hasNextPage) return; // 중복 호출 방지

    setLoading(true);
    try {
      const response = await getMyChatRooms(page);
      setChatRooms((prev) => [...prev, ...response.content]);
      setPage((prev) => prev + 1);
      setHasNextPage(response.hasNext);
    } catch (error) {
      console.error('채팅방 목록 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseLocalDateTime = (dateArray: number[]): Date | null => {
    if (!Array.isArray(dateArray) || dateArray.length < 6) return null;

    const [year, month, day, hour, minute, second] = dateArray;
    return new Date(year, month - 1, day, hour, minute, second);
  };

  const getTimeAgo = (dateArray?: number[] | null): string => {
    if (!dateArray) return '';

    const dateObj = parseLocalDateTime(dateArray);
    if (!dateObj) return '';

    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffYear > 0) return `${diffYear}년 전`;
    if (diffMonth > 0) return `${diffMonth}개월 전`;
    if (diffWeek > 0) return `${diffWeek}주 전`;
    if (diffDay > 0) return `${diffDay}일 전`;
    if (diffHour > 0) return `${diffHour}시간 전`;
    if (diffMin > 0) return `${diffMin}분 전`;
    return '방금 전';
  };

  useEffect(() => {
    fetchChatRooms();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4 border-b border-gray-300">
        <Text className="text-2xl font-bold">내 채팅방</Text>
      </View>

      {chatRooms.length === 0 && !loading ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">참여 중인 채팅방이 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={chatRooms}
          keyExtractor={(item) => item.chatRoomId.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="p-4 border-b border-gray-200 flex-row items-center"
              onPress={() =>
                router.push(`/myChat/${item.chatRoomId.toString()}`)
              }
            >
              {/* 프로필 이미지 */}
              <Image
                source={{
                  uri: item.joinUserImg,
                }}
                className="w-12 h-12 rounded-full"
              />

              {/* 텍스트 컨테이너 */}
              <View className="ml-4 flex-1">
                {/* 유저명 */}
                <Text className={`text-lg font-bold text-black`}>
                  {item.joinUserName}
                </Text>
                {/* 마지막 메시지 */}
                <Text
                  className="text-gray-500 text-sm truncate"
                  numberOfLines={1}
                >
                  {item.lastContent || '메시지가 없습니다.'}
                </Text>
              </View>

              {/* 우측 정보 */}
              <View className="items-end">
                <Text className="text-gray-400 text-xs">
                  {getTimeAgo(item.lastMessageTime)}
                </Text>
                {item.notReadMessageCnt > 0 && (
                  <View className="bg-red-500 w-5 h-5 rounded-full justify-center items-center mt-1">
                    <Text className="text-white text-xs font-bold">
                      {item.notReadMessageCnt}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
          onEndReached={fetchChatRooms} // 무한 스크롤 추가 로드
          onEndReachedThreshold={0.5} // 50% 지점에서 추가 로드
          ListFooterComponent={
            loading ? <ActivityIndicator size="large" color="#ff9900" /> : null
          }
        />
      )}
    </SafeAreaView>
  );
}
