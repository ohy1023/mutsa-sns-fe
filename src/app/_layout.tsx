import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import {
  NotoSans_400Regular,
  NotoSans_700Bold,
} from '@expo-google-fonts/noto-sans';
import '../../global.css';

SplashScreen.preventAutoHideAsync(); // 스플래시 화면 유지

export default function Layout() {
  const [fontsLoaded] = useFonts({
    NotoSans_400Regular,
    NotoSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync(); // 폰트 로드 완료 후 스플래시 종료
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // 폰트 로딩이 끝날 때까지 화면을 빈 상태로 유지
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
