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
import { useLocalSearchParams } from 'expo-router';
import { getUserInfo, getUserPosts } from '@/api/post';
import {
  followCheck,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowingUsers,
} from '@/api/follow';
import { UserDetailResponse, UserInfoResponse } from '@/types/user';
import { PostSummaryInfoResponse } from '@/types/post';

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

  const safeUserName = Array.isArray(userName) ? userName[0] : userName;

  useEffect(() => {
    async function fetchData() {
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
    }
    fetchData();
  }, [userName]);

  // 팔로우 / 언팔로우 버튼 핸들러
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
    } catch (error) {
      Alert.alert('오류', '팔로우 상태 변경 실패');
    }
  };

  // 게시물 무한 스크롤 로드
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

  // 팔로워 / 팔로잉 목록 모달 열기
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
        <TouchableOpacity
          onPress={() => openModal('followers')}
          className="mx-6"
        >
          <Text className="text-center text-xl font-bold text-black">
            {userInfo?.followerCount}
          </Text>
          <Text className="text-gray-600">팔로워</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => openModal('following')}
          className="mx-6"
        >
          <Text className="text-center text-xl font-bold text-black">
            {userInfo?.followingCount}
          </Text>
          <Text className="text-gray-600">팔로잉</Text>
        </TouchableOpacity>
      </View>

      {/* 버튼 영역 */}
      <View className="flex-row justify-center">
        <TouchableOpacity
          onPress={handleFollowToggle}
          className={`px-6 py-2 rounded-lg w-40 text-center ${
            isFollowing ? 'bg-gray-300' : 'bg-blue-600'
          }`}
        >
          <Text className="text-white text-center text-lg">
            {isFollowing ? '언팔로우' : '팔로우'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="px-6 py-2 ml-2 bg-gray-800 rounded-lg w-40 text-center">
          <Text className="text-white text-center text-lg">메시지</Text>
        </TouchableOpacity>
      </View>

      {/* 게시물 리스트 */}
      <FlatList
        data={posts}
        numColumns={3}
        keyExtractor={(item) => item.postId.toString()}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item.postThumbnailUrl }}
            className="w-[31%] h-32 m-1 rounded-md"
          />
        )}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
      />

      {/* 팔로워 / 팔로잉 모달 */}
      <Modal visible={modalVisible !== null} animationType="slide">
        <View className="flex-1 p-4">
          <Text className="text-xl font-bold mb-4">
            {modalVisible === 'followers' ? '팔로워' : '팔로잉'}
          </Text>
          <FlatList
            data={modalData}
            keyExtractor={(item) => item.userId.toString()}
            renderItem={({ item }) => (
              <View className="flex-row items-center p-2 border-b">
                <Image
                  source={{ uri: item.userImg }}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <Text className="text-lg">{item.userName}</Text>
              </View>
            )}
          />
          <TouchableOpacity
            className="mt-4 p-2 bg-gray-200 rounded-md"
            onPress={() => setModalVisible(null)}
          >
            <Text className="text-center">닫기</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
