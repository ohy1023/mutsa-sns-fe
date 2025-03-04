import { View, FlatList, Image, Text } from 'react-native';
import { useState, useEffect } from 'react';

export default function Home() {
  const [posts, setPosts] = useState<{ id: string; image: string }[]>([]);
  const [page, setPage] = useState(1);

  const fetchPosts = async () => {
    // 더미 데이터 (실제로는 API 요청)
    const newPosts = Array.from({ length: 10 }).map((_, i) => ({
      id: `${page}-${i}`,
      image: `https://source.unsplash.com/random/300x400?sig=${Math.random()}`,
    }));
    setPosts((prev) => [...prev, ...newPosts]);
    setPage(page + 1);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <View className="flex-1 bg-gray-100">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="mb-4">
            <Image source={{ uri: item.image }} className="w-full h-96" />
            <Text className="p-2 text-lg">게시물 설명...</Text>
          </View>
        )}
        onEndReached={fetchPosts} // 스크롤 끝에 도달하면 새로운 데이터 로드
        onEndReachedThreshold={0.5} // 50% 지점에서 추가 로드
      />
    </View>
  );
}
