import { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import debounce from 'lodash/debounce';
import { fetchUsers } from '@/api/search';
import { Page } from '@/types/common';
import { UserInfoResponse } from '@/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Search() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<UserInfoResponse[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [myUserName, setMyUserName] = useState<string | null>('');
  const router = useRouter();

  useEffect(() => {
    const fetchMyUserName = async () => {
      const storedUserName = await AsyncStorage.getItem('userName');
      setMyUserName(storedUserName);
    };
    fetchMyUserName();
  });

  useEffect(() => {
    if (query.trim()) {
      loadUsers(query, page, page > 0);
    }
  }, [query, page]);

  const loadUsers = async (
    newQuery: string,
    newPage: number,
    isLoadMore = false,
  ) => {
    if (loading) return;

    setLoading(true);
    try {
      const pageResponse: Page<UserInfoResponse> = await fetchUsers(
        newQuery,
        newPage,
      );
      const newUsers = pageResponse.content || [];
      setHasMore(!pageResponse.last);

      if (isLoadMore) {
        setUsers((prevUsers) => [...prevUsers, ...newUsers]);
      } else {
        setUsers(newUsers);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('검색 실패!', error.message);
      } else {
        Alert.alert('검색 실패!', '알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchUsers = debounce((searchText: string) => {
    if (searchText.trim()) {
      setUsers([]);
      setPage(0);
      loadUsers(searchText, 0, false);
    }
  }, 500);

  useEffect(() => {
    debouncedFetchUsers(query);
    return () => debouncedFetchUsers.cancel();
  }, [query]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleUserPress = (userName: string) => {
    if (myUserName && userName === myUserName) {
      router.push('/mypage');
    } else {
      router.push({
        pathname: `/profile/[userName]`,
        params: { userName },
      });
    }
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <TextInput
        className="border p-2 mb-4 rounded-md"
        placeholder="유저 검색"
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={users}
        keyExtractor={(item) => item.userId.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleUserPress(item.userName)}>
            <View className="flex-row items-center p-3 border-b border-gray-800">
              {/* 프로필 이미지 추가 */}
              <Image
                source={{
                  uri:
                    item.userImg ||
                    'https://your-default-profile-image-url.com',
                }}
                className="w-12 h-12 rounded-full mr-3"
              />

              {/* 사용자 정보 표시 */}
              <View className="flex-1">
                <Text className="text-black font-semibold text-lg">
                  {item.userName}
                </Text>
                <Text className="text-gray-400 text-sm">{item.nickName}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator size="small" color="#0000ff" /> : null
        }
      />
    </View>
  );
}
