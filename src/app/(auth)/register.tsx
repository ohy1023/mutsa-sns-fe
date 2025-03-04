import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import publicApi from '../../utils/publicApi';

export default function Register() {
  const [userName, setUserName] = useState<string>('');
  const [nickName, setNickName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const router = useRouter();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      return Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
    }

    try {
      await publicApi.post('/users/join', {
        userName,
        password,
      });
      Alert.alert('회원가입 성공', '로그인 해주세요.');
      router.replace('/login');
    } catch (error) {
      Alert.alert('회원가입 실패', '다시 시도해주세요.');
    }
  };

  return (
    <View className="flex-1 items-center justify-center p-4 bg-white">
      <Text className="text-2xl font-bold mb-4">회원가입</Text>
      <TextInput
        className="border p-3 rounded-md w-full mb-4"
        placeholder="아이디"
        value={userName}
        onChangeText={setUserName}
      />
      <TextInput
        className="border p-3 rounded-md w-full mb-4"
        placeholder="닉네임"
        value={nickName}
        onChangeText={setNickName}
      />
      <TextInput
        className="border p-3 rounded-md w-full mb-4"
        placeholder="비밀번호"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        className="border p-3 rounded-md w-full mb-4"
        placeholder="비밀번호 확인"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TouchableOpacity
        className="bg-green-500 p-3 rounded-md w-full"
        onPress={handleRegister}
      >
        <Text className="text-white text-center">회원가입</Text>
      </TouchableOpacity>
    </View>
  );
}
