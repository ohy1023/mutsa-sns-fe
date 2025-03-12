import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { loginUser } from '@/api/user';
import { InputField } from '@/components/InputField';
import { Button } from '@/components/Button';

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
      <InputField
        placeholder="아이디"
        value={userName}
        onChangeText={setUserName}
      />
      <InputField
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title="로그인"
        onPress={handleLogin}
        loading={loading}
        color="bg-blue-500"
      />
      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text className="text-gray-600">계정이 없나요? 회원가입</Text>
      </TouchableOpacity>
    </View>
  );
}
