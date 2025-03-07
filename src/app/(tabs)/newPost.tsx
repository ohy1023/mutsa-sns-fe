import * as ImagePicker from 'expo-image-picker';
import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { registerPost } from '@/api/post';
import { PostMediaRequest } from '@/types/post';
import { useRouter } from 'expo-router';

export default function NewPost() {
  const [postText, setPostText] = useState('');
  const [mediaState, setMediaState] = useState<PostMediaRequest[]>([]);
  const mediaRef = useRef(mediaState);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 미디어 선택
  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 10,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const mediaArray: PostMediaRequest[] = result.assets.map(
        (asset, index) => ({
          uri: asset.uri,
          order: index,
        }),
      );

      setMediaState(mediaArray);
      mediaRef.current = mediaArray;
    }
  };

  // 게시글 업로드
  const handlePost = async () => {
    if (!postText.trim() || mediaState.length === 0) {
      Alert.alert('경고', '내용이나 이미지를 추가해주세요.');
      return;
    }

    setLoading(true);
    try {
      await registerPost(postText, mediaState);
      Alert.alert('성공', '게시물이 업로드되었습니다.');

      setPostText('');
      setMediaState([]);
      mediaRef.current = [];
      router.push('/');
    } catch (error) {
      Alert.alert(
        '업로드 실패',
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setLoading(false);
    }
  };

  // 드래그 종료 시 상태 업데이트
  const onDragEnd = useCallback(({ data }: { data: PostMediaRequest[] }) => {
    const newData = data.map((item, idx) => ({
      ...item,
      order: idx,
    }));

    setMediaState(newData);
    mediaRef.current = newData;
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white p-4"
    >
      <Text className="text-xl font-bold mb-4">새 게시물</Text>

      <TouchableOpacity
        onPress={pickMedia}
        className="bg-gray-200 p-3 rounded-md mb-4"
      >
        <Text className="text-center text-gray-700">사진 선택 (최대 10장)</Text>
      </TouchableOpacity>

      {/* 이미지 리스트 (드래그 가능) */}
      {mediaState.length > 0 && (
        <DraggableFlatList
          data={mediaState}
          keyExtractor={(item) => `media-${item.uri}`}
          onDragEnd={onDragEnd}
          horizontal
          renderItem={({ item, drag }) => (
            <View className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-md mx-1 mb-3">
              <TouchableOpacity onLongPress={drag} className="w-full h-full">
                <Image
                  source={{ uri: item.uri }}
                  className="w-full h-full object-cover"
                />
              </TouchableOpacity>

              {/* 삭제 버튼 */}
              <TouchableOpacity
                onPress={() => {
                  const filteredMedia = mediaRef.current.filter(
                    (media) => media.uri !== item.uri,
                  );
                  const updatedMedia = filteredMedia.map((media, idx) => ({
                    ...media,
                    order: idx,
                  }));
                  setMediaState(updatedMedia);
                  mediaRef.current = updatedMedia;
                }}
                className="absolute top-0 right-0 bg-red-500 p-1 rounded-full"
              >
                <Text className="text-white text-xs font-bold">X</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <TextInput
        className="border p-3 rounded-md mb-4 bg-gray-100 text-gray-500"
        placeholder="내용을 입력하세요..."
        value={postText}
        onChangeText={setPostText}
      />

      <TouchableOpacity
        onPress={handlePost}
        className={`p-3 rounded-md ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}
        disabled={loading}
      >
        <Text className="text-center text-white font-bold">
          {loading ? '업로드 중...' : '게시하기'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
