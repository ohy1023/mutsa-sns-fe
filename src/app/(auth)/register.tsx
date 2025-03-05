import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { registerUser } from '@/api/user';
import { UserJoinRequest } from '@/types/user';

export default function Register() {
  const [userName, setUserName] = useState<string>('');
  const [nickName, setNickName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (
      !userName.trim() ||
      !nickName.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert('회원가입 실패', '모든 필드를 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('회원가입 실패', '비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      const userData: UserJoinRequest = { userName, nickName, password };
      const newUser = await registerUser(userData);

      Alert.alert('회원가입 성공', `${newUser.nickName}님, 가입을 환영합니다!`);
      router.replace('/login');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('회원가입 실패', error.message);
      } else {
        Alert.alert('회원가입 실패', '알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center p-4 bg-white">
      <Text className="text-2xl font-bold mb-4">회원가입</Text>
      <TextInput
        className="border p-3 rounded-md w-full mb-4"
        placeholder="아이디"
        autoCapitalize="none"
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
        className={`p-3 rounded-md w-full ${
          loading ? 'bg-gray-400' : 'bg-green-500'
        }`}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text className="text-white text-center">
          {loading ? '회원가입 중...' : '회원가입'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
