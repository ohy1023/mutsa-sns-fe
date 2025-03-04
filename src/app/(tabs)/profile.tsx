import { View, Text, Image } from 'react-native';

export default function Profile() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Image
        source={{ uri: 'https://via.placeholder.com/100' }}
        className="w-24 h-24 rounded-full"
      />
      <Text className="text-xl mt-4">사용자 이름</Text>
    </View>
  );
}
