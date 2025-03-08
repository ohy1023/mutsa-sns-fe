import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  NotoSans_400Regular,
  NotoSans_700Bold,
  NotoSans_900Black,
} from '@expo-google-fonts/noto-sans';
import { View, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import '../../global.css';

SplashScreen.preventAutoHideAsync(); // 스플래시 화면 유지

export default function Layout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  // 폰트 로드
  const [fontsLoaded] = useFonts({
    NotoSans_400Regular,
    NotoSans_700Bold,
    NotoSans_900Black,
  });

  // 로그인 상태 체크
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('authToken');
      setIsAuthenticated(!!token); // 토큰이 있으면 true, 없으면 false
    };

    checkAuth();
  }, []);

  // 스플래시 숨기기
  useEffect(() => {
    const hideSplash = async () => {
      if (fontsLoaded && isAuthenticated !== null) {
        await SplashScreen.hideAsync();
        if (!isAuthenticated) {
          router.replace('/login'); // 로그인하지 않은 경우 로그인 페이지로 이동
        }
      }
    };

    hideSplash();
  }, [fontsLoaded, isAuthenticated]);

  // 폰트 & 로그인 체크 완료 전까지 로딩 화면 유지
  if (!fontsLoaded || isAuthenticated === null) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#ff9900" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="(auth)/login" />
      )}
      <Stack.Screen name="profile/[userName]" />
      <Stack.Screen name="post/[postId]" />
      <Stack.Screen name="myChat" />
    </Stack>
  );
}
