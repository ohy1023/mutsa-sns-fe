import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Dimensions,
  SafeAreaView,
  Modal,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getPostDetail, addLike, removeLike, deletePost } from '@/api/post';
import { PostDetailResponse } from '@/types/post';
import { Ionicons } from '@expo/vector-icons';
import CommentModal from '@/components/CommentModal';

const { width } = Dimensions.get('window');

export default function PostDetail() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();
  const [post, setPost] = useState<PostDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);

  const toggleLike = async () => {
    try {
      if (isLiked) {
        await removeLike(Number(postId));
        setLikeCount((prev) => prev - 1);
      } else {
        await addLike(Number(postId));
        setLikeCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      Alert.alert('오류', '좋아요 처리 중 문제가 발생했습니다.');
    }
  };

  useEffect(() => {
    async function fetchPost() {
      try {
        const postData = await getPostDetail(Number(postId));
        setPost(postData);
        setLikeCount(postData.likeCnt);
        setIsLiked(postData.isLiked ?? false);
        setIsOwner(postData.isOwner ?? false);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#ff9900" />
      </View>
    );
  }

  if (!post) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">게시글을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white pt-6">
      {/* 상단 헤더 */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-300">
        {/* 뒤로 가기 버튼 (왼쪽 고정) */}
        <TouchableOpacity onPress={() => router.back()} className="w-10">
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>

        {/* 사용자 정보 (가운데 정렬) */}
        <View className="flex-1 flex-row items-center justify-center">
          <Image
            source={{ uri: post.userImg }}
            className="w-8 h-8 rounded-full mr-2"
          />
          <Text className="font-bold text-lg">{post.userName}</Text>
        </View>

        {/* 🔥 현재 로그인한 사용자만 `더보기(...)` 버튼 표시 */}
        {isOwner ? (
          <TouchableOpacity
            onPress={() => setShowOptions(true)}
            className="w-10 items-end"
          >
            <Ionicons name="ellipsis-horizontal" size={24} color="black" />
          </TouchableOpacity>
        ) : (
          <View className="w-10" /> // isOwner가 false일 때 자리를 차지하는 빈 View
        )}
      </View>

      {/* 이미지 슬라이더 */}
      <FlatList
        className="flex-none"
        data={post.postMediaDtoList}
        keyExtractor={(item) => item.mediaUrl}
        horizontal
        pagingEnabled
        snapToAlignment="center"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item.mediaUrl }}
            style={{ width, height: 450 }} // 이미지 크기 고정
            className="object-cover"
          />
        )}
      />

      {/* 이미지 개수 및 현재 위치 표시 */}
      <View className="pt-3 flex-row justify-center">
        {post.postMediaDtoList.map((_, index) => (
          <Text key={index} className="mx-1 text-lg">
            {currentIndex === index ? '●' : '○'}
          </Text>
        ))}
      </View>

      {/* 게시물 정보 */}
      <View className="p-4">
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity onPress={toggleLike}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={28}
              color={isLiked ? 'red' : 'black'}
            />
          </TouchableOpacity>
          <Text className="ml-3 font-bold text-lg mr-3">{likeCount}</Text>
          {/* 좋아요 수 표시 */}
          <TouchableOpacity onPress={() => setIsCommentModalVisible(true)}>
            <Ionicons name="chatbubble-outline" size={28} color="black" />
          </TouchableOpacity>
          <Text className="ml-3 font-bold text-lg mr-3">{post.commentCnt}</Text>
          {/* 댓글 수 표시 */}
          <TouchableOpacity>
            <Ionicons name="paper-plane-outline" size={28} color="black" />
          </TouchableOpacity>
        </View>

        {/* 게시글 내용 */}
        <Text className="mt-5">
          <Text className="font-bold">{post.userName} </Text>
          {post.body}
        </Text>

        {/* 날짜 */}
        <Text className="text-gray-500 text-sm mt-3">{post.registeredAt}</Text>
      </View>

      {/* 🔥 수정 & 삭제 모달 */}
      <Modal visible={showOptions} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white p-4 rounded-t-lg">
            <TouchableOpacity
              className="p-3 border-b border-gray-300"
              onPress={() => {
                setShowOptions(false);
                Alert.alert('수정 기능 준비 중');
              }}
            >
              <Text className="text-lg text-center">수정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="p-3"
              onPress={() => {
                setShowOptions(false);
                deletePost(Number(postId));
                router.push(`/profile/${post.userName}`);
              }}
            >
              <Text className="text-lg text-center text-red-500">삭제</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="mt-2 p-3 bg-gray-200 rounded-md"
              onPress={() => setShowOptions(false)}
            >
              <Text className="text-center">닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CommentModal
        postId={Number(postId)}
        isVisible={isCommentModalVisible}
        onClose={() => setIsCommentModalVisible(false)}
      />
    </SafeAreaView>
  );
}
