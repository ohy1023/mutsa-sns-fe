import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import publicApi from '../../utils/publicApi';

export default function Login() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await publicApi.post('/users/login', {
        userName,
        password,
      });

      console.log(response.data);
      const token = response.data.result.jwt;

      // 로그인 성공 시 토큰과 userName 저장
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userName', userName);

      router.replace('/'); // 로그인 후 홈으로 이동
    } catch (error) {
      Alert.alert('로그인 실패', '아이디 또는 비밀번호를 확인하세요.');
    }
  };

  return (
    <View className="flex-1 items-center justify-center p-4 bg-white">
      <Text className="text-2xl font-bold mb-4">로그인</Text>
      <TextInput
        className="border p-3 rounded-md w-full mb-4"
        placeholder="아이디"
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
        className="bg-blue-500 p-3 rounded-md w-full mb-2"
        onPress={handleLogin}
      >
        <Text className="text-white text-center">로그인</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text className="text-gray-600">계정이 없나요? 회원가입</Text>
      </TouchableOpacity>
    </View>
  );
}
