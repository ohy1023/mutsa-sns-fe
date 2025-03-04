import { View, TextInput, FlatList, Text } from 'react-native';
import { useState } from 'react';

export default function Search() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<string[]>([]);

  const handleSearch = (text: string) => {
    setQuery(text);
    setUsers(['user1', 'user2', 'user3'].filter((u) => u.includes(text)));
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <TextInput
        className="border p-2 mb-4 rounded-md"
        placeholder="유저 검색"
        value={query}
        onChangeText={handleSearch}
      />
      <FlatList
        data={users}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <Text className="p-2">{item}</Text>}
      />
    </View>
  );
}
