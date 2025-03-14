import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getUserPosts } from '@/api/post';
import { getUserInfo } from '@/api/user';
import {
  followCheck,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowingUsers,
} from '@/api/follow';
import { createChatRoom } from '@/api/chat';
import { UserDetailResponse, UserInfoResponse } from '@/types/user';
import { PostSummaryInfoResponse } from '@/types/post';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';

export default function Profile() {
  const { userName } = useLocalSearchParams<{ userName: string }>();
  const [userInfo, setUserInfo] = useState<UserDetailResponse | null>(null);
  const [posts, setPosts] = useState<PostSummaryInfoResponse[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postPage, setPostPage] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [modalVisible, setModalVisible] = useState<
    'followers' | 'following' | null
  >(null);
  const [modalData, setModalData] = useState<UserInfoResponse[]>([]);
  const router = useRouter();
  const safeUserName = Array.isArray(userName) ? userName[0] : userName;

  const fetchData = async () => {
    try {
      const userData = await getUserInfo(safeUserName);
      const userPosts = await getUserPosts(safeUserName, 0);
      setUserInfo(userData);
      setPosts(userPosts.content);
      setIsFollowing(await followCheck(safeUserName));
      setHasMorePosts(!userPosts.last);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userName]);

  const handleFollowToggle = async () => {
    if (!userInfo) return;
    try {
      if (isFollowing) {
        await unfollowUser(userInfo.userName);
        setIsFollowing(false);
      } else {
        await followUser(userInfo.userName);
        setIsFollowing(true);
      }
      await fetchData();
    } catch (error) {
      Alert.alert('오류', '팔로우 상태 변경 실패');
    }
  };

  const handleMessagePress = async () => {
    if (!userInfo) return;

    try {
      const response = await createChatRoom({
        joinUserName: userInfo.userName,
      });
      const chatRoomId = response.chatNo;
      router.push(`/myChat/${chatRoomId}`);
    } catch (error) {
      Alert.alert('오류', '채팅방을 생성하는 데 실패했습니다.');
    }
  };

  const loadMorePosts = async () => {
    if (!hasMorePosts) return;
    try {
      const nextPage = postPage + 1;
      const userPosts = await getUserPosts(safeUserName, nextPage);
      setPosts((prev) => [...prev, ...userPosts.content]);
      setHasMorePosts(!userPosts.last);
      setPostPage(nextPage);
    } catch (error) {
      console.error(error);
    }
  };

  const openModal = async (type: 'followers' | 'following') => {
    try {
      const data =
        type === 'followers'
          ? await getFollowers(safeUserName, 0)
          : await getFollowingUsers(safeUserName, 0);
      setModalData(data.content);
      setModalVisible(type);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePostPress = (postId: number) => {
    router.push(`/post/${postId}`);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#ff9900" />
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 pt-14">
      {/* 프로필 섹션 */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Image
            source={{
              uri:
                userInfo?.userImg ||
                'https://your-default-profile-image-url.com',
            }}
            className="w-24 h-24 rounded-full border border-gray-300"
          />
          <View className="ml-4">
            <Text className="text-2xl font-bold text-black">
              {userInfo?.userName}
            </Text>
            <Text className="text-gray-600">{userInfo?.nickName}</Text>
          </View>
        </View>
      </View>

      {/* 팔로워 / 팔로잉 정보 */}
      <View className="flex-row justify-center mb-4">
        <Button
          title={`팔로워 ${userInfo?.followerCount}`}
          onPress={() => openModal('followers')}
        />
        <Button
          title={`팔로잉 ${userInfo?.followingCount}`}
          onPress={() => openModal('following')}
        />
      </View>

      {/* 버튼 영역 */}
      <View className="flex-row justify-center">
        <Button
          title={isFollowing ? '언팔로우' : '팔로우'}
          onPress={handleFollowToggle}
          color={isFollowing ? 'bg-gray-300' : 'bg-blue-600'}
        />
        <Button
          title="메시지"
          onPress={handleMessagePress}
          color="bg-gray-800"
        />
      </View>

      {/* 게시물 리스트 */}
      <FlatList
        className="pt-10"
        data={posts}
        numColumns={3}
        keyExtractor={(item) => item.postId.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handlePostPress(item.postId)}
            className="w-[31%] h-32 m-1 rounded-md"
          >
            <Image
              source={{ uri: item.postThumbnailUrl }}
              className="w-full h-32"
            />
          </TouchableOpacity>
        )}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
      />

      {/* 팔로워 / 팔로잉 모달 */}
      <Modal visible={modalVisible !== null} animationType="slide">
        <SafeAreaView className="flex-1 bg-white">
          <View className="pt-6 px-4">
            <View className="flex-row items-center mb-4">
              <TouchableOpacity
                onPress={() => setModalVisible(null)}
                className="pr-4"
              >
                <Ionicons name="chevron-back" size={24} color="black" />
              </TouchableOpacity>
              <Text className="text-xl font-bold">
                {modalVisible === 'followers' ? '팔로워' : '팔로잉'}
              </Text>
            </View>

            {/* 유저 리스트 */}
            <FlatList
              data={modalData}
              keyExtractor={(item) => item.userId.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(null);
                    router.push(`/profile/${item.userName}`);
                  }}
                  className="flex-row items-center p-2 border-b"
                >
                  <Image
                    source={{ uri: item.userImg }}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <Text className="text-lg">{item.userName}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
