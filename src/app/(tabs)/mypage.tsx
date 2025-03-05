import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Mypage() {
  const router = useRouter();

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken'); // 토큰 삭제
      await AsyncStorage.removeItem('userName');
      Alert.alert('로그아웃', '로그아웃되었습니다.', [
        { text: '확인', onPress: () => router.replace('/login') },
      ]);
    } catch (error) {
      Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl mb-4">My Page</Text>

      {/* 로그아웃 버튼 */}
      <TouchableOpacity
        onPress={handleLogout}
        className="bg-red-500 px-4 py-2 rounded-md"
      >
        <Text className="text-white font-bold">로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
}
