import {
  View,
  FlatList,
  Image,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { getFollowingFeed, addLike, removeLike } from '@/api/post';
import { PostDetailResponse } from '@/types/post';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CommentModal from '@/components/CommentModal';
import { Dimensions } from 'react-native';

export default function Home() {
  const [posts, setPosts] = useState<PostDetailResponse[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const imageWidth = screenWidth * 0.98;
  const imageHeight = imageWidth * 1;

  const fetchPosts = async () => {
    if (loading) return; // 중복 호출 방지
    setLoading(true);

    try {
      const newPosts = await getFollowingFeed(page);
      setPosts((prev) => [...prev, ...newPosts.content]);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleShare = () => {
    Alert.alert('채팅 기능 준비 중');
  };

  const toggleLike = async (
    postId: number,
    isLiked: boolean,
    index: number,
  ) => {
    try {
      const updatedPosts = [...posts];

      if (isLiked) {
        await removeLike(postId);
        updatedPosts[index].likeCnt -= 1;
      } else {
        await addLike(postId);
        updatedPosts[index].likeCnt += 1;
      }
      updatedPosts[index].isLiked = !isLiked;
      setPosts(updatedPosts);
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.postId.toString()}
        renderItem={({ item, index }) => (
          <>
            {/* 사용자 정보 */}
            <View className="flex-row items-center p-4">
              <TouchableOpacity
                onPress={() => router.push(`/profile/${item.userName}`)}
              >
                <Image
                  source={{ uri: item.userImg }}
                  className="w-10 h-10 rounded-full"
                />
              </TouchableOpacity>
              <Text className="ml-3 font-bold text-lg">{item.userName}</Text>
            </View>

            <FlatList
              data={item.postMediaDtoList}
              horizontal
              keyExtractor={(media) => media.mediaUrl}
              renderItem={({ item: media }) => (
                <Image
                  source={{ uri: media.mediaUrl }}
                  style={{
                    width: imageWidth,
                    height: imageHeight,
                    margin: 4,
                    borderRadius: 8,
                  }}
                />
              )}
              showsHorizontalScrollIndicator={false}
            />

            {/* 좋아요 및 댓글 정보 */}
            <View className="p-4">
              <Text className="text-gray-700">{item.body}</Text>

              <View className="flex-row items-center mt-2">
                <TouchableOpacity
                  onPress={() => toggleLike(item.postId, item.isLiked, index)}
                >
                  <Ionicons
                    name={item.isLiked ? 'heart' : 'heart-outline'}
                    size={24}
                    color={item.isLiked ? 'red' : 'black'}
                  />
                </TouchableOpacity>
                <Text className="ml-2">{item.likeCnt}</Text>

                <TouchableOpacity
                  onPress={() => {
                    setSelectedPostId(item.postId);
                    setIsCommentModalVisible(true);
                  }}
                  className="ml-4"
                >
                  <Ionicons name="chatbubble-outline" size={24} color="black" />
                </TouchableOpacity>
                <Text className="ml-2">{item.commentCnt}</Text>

                <TouchableOpacity onPress={handleShare} className="ml-4">
                  <Ionicons
                    name="paper-plane-outline"
                    size={24}
                    color="black"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
        onEndReached={fetchPosts} // 스크롤 끝에 도달하면 새로운 데이터 로드
        onEndReachedThreshold={0.5} // 50% 지점에서 추가 로드
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" color="#ff9900" /> : null
        }
      />

      {/* 댓글 모달 */}
      {selectedPostId !== null && (
        <CommentModal
          postId={selectedPostId}
          isVisible={isCommentModalVisible}
          onClose={() => setIsCommentModalVisible(false)}
        />
      )}
    </View>
  );
}
