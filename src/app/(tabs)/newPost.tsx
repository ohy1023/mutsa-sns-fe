import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Button,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';

// ✅ 서버 API URL (백엔드 IP 또는 도메인)
const API_URL = 'http://localhost:8089/api/v1/posts';

type MediaItem = {
  uri: string;
  type: 'image';
  order: number;
};

export default function NewPost() {
  const [postText, setPostText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  /** 미디어 선택 */
  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 10,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const mediaArray: MediaItem[] = result.assets.map((asset, index) => ({
        uri: asset.uri,
        type: 'image',
        order: index, // 순서 부여
      }));
      setSelectedMedia(mediaArray);
    }
  };

  const handlePost = async () => {
    if (!postText.trim() || selectedMedia.length === 0) {
      Alert.alert('경고', '내용이나 이미지를 추가해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('postCreateRequest', JSON.stringify({ body: postText }));

    // 이미지 파일을 FormData에 추가
    await Promise.all(
      selectedMedia.map(async (item, index) => {
        const response = await fetch(item.uri);
        const blob = await response.blob();
        formData.append('mediaFiles', {
          uri: item.uri,
          name: `image-${index}.jpg`,
          type: 'image/jpeg',
        } as any);
      }),
    );

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer YOUR_ACCESS_TOKEN`, // JWT 토큰 추가
        },
        body: formData,
      });

      if (response.ok) {
        Alert.alert('성공', '게시물이 업로드되었습니다.');
        setPostText('');
        setSelectedMedia([]);
      } else {
        Alert.alert('오류', '게시물 업로드 실패.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '네트워크 오류가 발생했습니다.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white p-4"
    >
      <Text className="text-xl font-bold mb-4">새 게시물 작성</Text>

      <TouchableOpacity
        onPress={pickMedia}
        className="bg-gray-200 p-3 rounded-md mb-4"
      >
        <Text className="text-center text-gray-700">
          📸 사진 선택 (최대 10개)
        </Text>
      </TouchableOpacity>

      {/* 순서 변경 가능하도록 DraggableFlatList 사용 */}
      {selectedMedia.length > 0 && (
        <DraggableFlatList
          data={selectedMedia}
          keyExtractor={(item, index) => `${item.uri}-${index}`}
          onDragEnd={({ data }) => setSelectedMedia(data)} // 순서 변경 반영
          horizontal
          renderItem={({ item, drag, isActive }) => {
            const index = selectedMedia.findIndex(
              (media) => media.uri === item.uri,
            );

            return (
              <View className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-md mx-1 mb-3">
                <Image
                  source={{ uri: item.uri }}
                  className="w-full h-full object-cover"
                />

                {/* 삭제 버튼 */}
                <TouchableOpacity
                  onPress={() =>
                    setSelectedMedia((prev) =>
                      prev.filter((_, i) => i !== index),
                    )
                  }
                  className="absolute top-0 right-0 bg-red-500 p-1 rounded-full"
                >
                  <Text className="text-white text-xs font-bold">X</Text>
                </TouchableOpacity>

                {/* 드래그 핸들러 */}
                <TouchableOpacity
                  onLongPress={drag}
                  disabled={isActive}
                  className="absolute inset-0"
                />
              </View>
            );
          }}
        />
      )}

      {/* 입력 필드 (클릭 시 모달 열기) */}
      <TextInput
        className="border p-3 rounded-md mb-4 bg-gray-100 text-gray-500"
        placeholder="내용을 입력하세요..."
        value={postText}
        onFocus={() => setModalVisible(true)}
      />

      {/* 모달 화면 */}
      <Modal visible={modalVisible} animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 p-4 bg-white"
        >
          <Text className="text-xl font-bold mt-10">게시글 입력</Text>
          <TextInput
            className="border p-3 rounded-md h-40"
            placeholder="내용을 입력하세요..."
            value={postText}
            onChangeText={setPostText}
            multiline
            autoFocus
          />
          <Button title="완료" onPress={() => setModalVisible(false)} />
        </KeyboardAvoidingView>
      </Modal>

      {/* 게시하기 버튼 */}
      <TouchableOpacity
        onPress={handlePost}
        className={`p-3 rounded-md ${
          postText || selectedMedia.length > 0 ? 'bg-blue-500' : 'bg-gray-300'
        }`}
        disabled={!postText && selectedMedia.length === 0}
      >
        <Text className="text-center text-white font-bold">게시하기</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
