import { Tabs, useRouter } from 'expo-router';
import {
  View,
  TouchableOpacity,
  Text,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Bell, MessageCircle } from 'lucide-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useState, useEffect } from 'react';
import { getAlarms } from '@/api/alarm';
import { AlarmDto } from '@/types/alarm';

export default function TabLayout() {
  const [isAlarmModalVisible, setIsAlarmModalVisible] = useState(false);
  const [alarms, setAlarms] = useState<AlarmDto[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const router = useRouter();

  const fetchAlarms = async () => {
    if (loading || !hasNextPage) return; // 중복 호출 방지 + 마지막 페이지 체크

    setLoading(true);
    try {
      const alarmData = await getAlarms(page);
      setAlarms((prev) => [...prev, ...alarmData.content]); // 기존 데이터에 추가
      setPage((prev) => prev + 1);
      setHasNextPage(!alarmData.last); // 마지막 페이지 여부 체크
    } catch (error) {
      console.error('알림 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAlarmModalVisible) {
      setPage(0);
      setAlarms([]);
      setHasNextPage(true);
      fetchAlarms();
    }
  }, [isAlarmModalVisible]);

  const handleAlarmClick = (alarm: AlarmDto) => {
    setIsAlarmModalVisible(false);
    switch (alarm.alarmType) {
      case 'LIKE':
      case 'COMMENT':
        router.push(`/post/${alarm.targetUserName}`);
        break;
      case 'FOLLOW':
        router.push(`/profile/${alarm.fromUserName}`);
        break;
      default:
        Alert.alert('알림', '잘못된 알림 유형입니다.');
        break;
    }
  };

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <Tabs
          screenOptions={{
            headerTitle: '',
            headerStyle: { backgroundColor: 'white' },
            headerShadowVisible: false,
            headerLeft: () => (
              <View className="pl-4">
                <Text className="text-lg font-bold text-black">MustaSns</Text>
              </View>
            ),
            headerRight: () => (
              <View className="flex-row gap-4 pr-4">
                <TouchableOpacity onPress={() => setIsAlarmModalVisible(true)}>
                  <Bell size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <MessageCircle size={24} color="black" />
                </TouchableOpacity>
              </View>
            ),
            tabBarStyle: {
              backgroundColor: 'white',
              height: 60,
              borderTopWidth: 0.5,
              borderTopColor: '#ddd',
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{ title: '홈', tabBarIcon: () => <Text>🏠</Text> }}
          />
          <Tabs.Screen
            name="search"
            options={{ title: '검색', tabBarIcon: () => <Text>🔍</Text> }}
          />
          <Tabs.Screen
            name="newPost"
            options={{ title: '새 게시물', tabBarIcon: () => <Text>✏️</Text> }}
          />
          <Tabs.Screen
            name="mypage"
            options={{ title: '마이페이지', tabBarIcon: () => <Text>👤</Text> }}
          />
        </Tabs>

        {/* 알림 모달 (무한 스크롤 적용) */}
        <Modal visible={isAlarmModalVisible} animationType="slide" transparent>
          <View className="flex-1 justify-end bg-black bg-opacity-50">
            <View className="bg-white p-4 rounded-t-lg h-[70%]">
              <Text className="text-lg font-bold text-center pb-3">알림</Text>

              {alarms.length === 0 && !loading ? (
                <Text className="text-gray-500 text-center">
                  새로운 알림이 없습니다.
                </Text>
              ) : (
                <FlatList
                  data={alarms}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className="p-3 border-b border-gray-300"
                      onPress={() => handleAlarmClick(item)}
                    >
                      <Text className="text-lg">{item.text}</Text>
                      <Text className="text-gray-500 text-sm">
                        {item.registeredAt}
                      </Text>
                    </TouchableOpacity>
                  )}
                  onEndReached={fetchAlarms} // 스크롤 끝에서 추가 로드
                  onEndReachedThreshold={0.5} // 50% 스크롤 시점에서 로드
                  ListFooterComponent={
                    loading ? (
                      <ActivityIndicator size="large" color="#ff9900" />
                    ) : null
                  }
                />
              )}

              <TouchableOpacity
                className="mt-2 p-3 bg-gray-200 rounded-md"
                onPress={() => setIsAlarmModalVisible(false)}
              >
                <Text className="text-center">닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
