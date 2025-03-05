import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { loginUser } from '@/api/user';

export default function Login() {
  const [userName, setUserName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!userName.trim() || !password.trim()) {
      Alert.alert('로그인 실패', '아이디와 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const token = await loginUser({ userName, password });
      console.log('로그인 성공:', token);

      router.replace('/'); // 로그인 후 홈으로 이동
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('로그인 실패', error.message);
      } else {
        Alert.alert('로그인 실패', '알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center p-4 bg-white">
      <Text className="text-2xl font-bold mb-4">로그인</Text>
      <TextInput
        className="border p-3 rounded-md w-full mb-4"
        placeholder="아이디"
        autoCapitalize="none"
        value={userName}
        onChangeText={setUserName}
      />
      <TextInput
        className="border p-3 rounded-md w-full mb-4"
        placeholder="비밀번호"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        className={`p-3 rounded-md w-full mb-2 ${
          loading ? 'bg-gray-400' : 'bg-blue-500'
        }`}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text className="text-white text-center">
          {loading ? '로그인 중...' : '로그인'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text className="text-gray-600">계정이 없나요? 회원가입</Text>
      </TouchableOpacity>
    </View>
  );
}
