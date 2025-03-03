import React from 'react';
import { View, Text } from 'react-native';

export default function Home() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-100">
      <Text className="text-lg font-sans">기본 Noto Sans 적용 (font-sans)</Text>
      <Text className="text-xl font-noto">Noto Sans Regular 적용</Text>
      <Text className="text-2xl font-notoBold">Noto Sans Bold 적용</Text>
    </View>
  );
}
