import AsyncStorage from '@react-native-async-storage/async-storage';

// 토큰 저장
export const setToken = async (token: string) => {
  await AsyncStorage.setItem('authToken', token);
};

// 토큰 가져오기
export const getToken = async () => {
  return await AsyncStorage.getItem('authToken');
};

// 토큰 삭제 (로그아웃 시)
export const removeToken = async () => {
  await AsyncStorage.removeItem('authToken');
};
