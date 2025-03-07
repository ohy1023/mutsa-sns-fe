import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getMyPosts } from '@/api/post';
import { getMyInfo, changeUserInfo } from '@/api/user';
import { getMyFollowers, getMyFollowing } from '@/api/follow';
import { UserDetailResponse, UserInfoResponse } from '@/types/user';
import { PostSummaryInfoResponse } from '@/types/post';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

export default function Mypage() {
  const [userInfo, setUserInfo] = useState<UserDetailResponse>(
    {} as UserDetailResponse,
  );
  const [posts, setPosts] = useState<PostSummaryInfoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [postPage, setPostPage] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [modalVisible, setModalVisible] = useState<
    'followers' | 'following' | null
  >(null);
  const [modalData, setModalData] = useState<UserInfoResponse[]>([]);
  const router = useRouter();
  const [editModalVisible, setEditModalVisible] = useState<'edit' | null>(null);
  const [newNickName, setNewNickName] = useState('');
  const [newProfileImage, setNewProfileImage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const userData = await getMyInfo();
      const userPosts = await getMyPosts(0);
      setUserInfo(userData);
      setPosts(userPosts.content);
      setNewNickName(userData.nickName);
      setHasMorePosts(!userPosts.last);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 게시물 무한 스크롤 로드
  const loadMorePosts = async () => {
    if (!hasMorePosts) return;
    try {
      const nextPage = postPage + 1;
      const userPosts = await getMyPosts(nextPage);
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
          ? await getMyFollowers(0)
          : await getMyFollowing(0);
      setModalData(data.content);
      setModalVisible(type);
    } catch (error) {
      console.error(error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setNewProfileImage(result.assets[0].uri);
    }
  };

  const editProfile = async () => {
    try {
      await changeUserInfo(newNickName, newProfileImage);
      await fetchData();
      setEditModalVisible(null);
      Alert.alert('성공', '프로필이 수정되었습니다.');
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '프로필 수정에 실패했습니다.');
    }
  };

  // 로그아웃 기능
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userName');
      Alert.alert('로그아웃', '로그아웃되었습니다.', [
        { text: '확인', onPress: () => router.replace('/login') },
      ]);
    } catch {
      Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
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
              uri: userInfo.userImg,
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
          <Text className="text-left text-xl font-bold text-black">
            {userInfo?.followerCount}
          </Text>
          <Text className="text-gray-600">팔로워</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => openModal('following')}
          className="mx-6"
        >
          <Text className="text-left text-xl font-bold text-black">
            {userInfo?.followingCount}
          </Text>
          <Text className="text-gray-600">팔로잉</Text>
        </TouchableOpacity>
      </View>
      {/* 버튼 영역 */}
      <View className="flex-row justify-center">
        <TouchableOpacity
          className={`px-6 py-2 rounded-lg w-48 text-center bg-gray-800`}
          onPress={() => setEditModalVisible('edit')}
        >
          <Text className="text-white text-center text-lg">프로필 편집</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="px-6 py-2 ml-2 bg-red-500 rounded-lg w-48 text-center"
          onPress={handleLogout}
        >
          <Text className="text-white text-center text-lg">로그아웃</Text>
        </TouchableOpacity>
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
          {/* SafeArea 적용 후 패딩 추가하여 상태바와 겹치지 않도록 수정 */}
          <View className="pt-6 px-4">
            {/* 상단 헤더 */}
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

      <Modal visible={editModalVisible === 'edit'} animationType="slide">
        <SafeAreaView className="flex-1 bg-white p-6">
          <TouchableOpacity onPress={() => setEditModalVisible(null)}>
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold mb-4">프로필 편집</Text>
          <TouchableOpacity onPress={pickImage} className="mb-4">
            <Image
              source={{ uri: newProfileImage || userInfo?.userImg }}
              className="w-24 h-24 rounded-full self-center"
            />
          </TouchableOpacity>
          <TextInput
            className="border p-2 rounded-lg mb-4"
            defaultValue={userInfo.nickName}
            value={newNickName}
            onChangeText={setNewNickName}
          />
          <TouchableOpacity
            onPress={editProfile}
            className="bg-green-500 p-3 rounded-lg text-center"
          >
            <Text className="text-white text-lg text-center">저장</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
