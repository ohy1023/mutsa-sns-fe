import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PostItemProps } from '@/types/post';

export function PostItem({
  postId,
  userName,
  userImg,
  postThumbnailUrl,
  likeCnt,
  commentCnt,
}: PostItemProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/post/${postId}`)}
      className="p-4 border-b border-gray-200"
    >
      <View className="flex-row items-center">
        <Image source={{ uri: userImg }} className="w-10 h-10 rounded-full" />
        <Text className="ml-3 font-bold text-lg">{userName}</Text>
      </View>

      <Image
        source={{ uri: postThumbnailUrl }}
        className="w-full h-60 rounded-md mt-2"
      />

      <View className="flex-row items-center mt-2">
        <Ionicons name="heart-outline" size={24} color="black" />
        <Text className="ml-2">{likeCnt}</Text>

        <Ionicons
          name="chatbubble-outline"
          size={24}
          color="black"
          className="ml-4"
        />
        <Text className="ml-2">{commentCnt}</Text>
      </View>
    </TouchableOpacity>
  );
}
