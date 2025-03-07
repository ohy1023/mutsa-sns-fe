import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getComments,
  postComment,
  deleteComment,
  updateComment,
} from '@/api/comment';
import { Comment } from '@/types/comment';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');

interface CommentModalProps {
  isVisible: boolean;
  onClose: () => void;
  postId: number;
}

export default function CommentModal({
  isVisible,
  onClose,
  postId,
}: CommentModalProps) {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const modalY = useRef(new Animated.Value(height)).current;
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const [loggedInUserName, setLoggedInUserName] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedText, setEditedText] = useState('');

  useEffect(() => {
    if (isVisible) {
      openModal();
      fetchComments();
    }
  }, [isVisible]);

  const fetchComments = async () => {
    try {
      const fetchedComments = await getComments(postId, 0);
      setComments(fetchedComments.content);
    } catch (error) {
      console.error('댓글 불러오기 실패:', error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim()) return;

    try {
      await postComment(postId, { comment });
      setComment('');
      fetchComments(); // 새 댓글 반영
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(commentId);
      fetchComments(); // 삭제 후 목록 갱신
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
    }
  };

  const openModal = () => {
    Animated.timing(modalY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalY, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const handleEditComment = (commentId: number, currentText: string) => {
    setEditingCommentId(commentId);
    setEditedText(currentText);
  };

  const handleUpdateComment = async () => {
    if (!editedText.trim() || editingCommentId === null) return;

    try {
      await updateComment(Number(postId), editingCommentId, {
        comment: editedText,
      });
      setEditingCommentId(null);
      setEditedText('');
      fetchComments(); // 수정 후 목록 갱신
    } catch (error) {
      console.error('댓글 수정 실패:', error);
    }
  };

  useEffect(() => {
    const getUserName = async () => {
      try {
        const storedUserName = await AsyncStorage.getItem('userName');
        setLoggedInUserName(storedUserName);
      } catch (error) {
        console.error('유저 정보 불러오기 실패:', error);
      }
    };
    getUserName();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        Animated.timing(keyboardHeight, {
          toValue: event.endCoordinates.height,
          duration: 300,
          useNativeDriver: true,
        }).start();
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <Modal transparent animationType="none" visible={isVisible}>
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={closeModal}
        />
        <Animated.View
          style={{
            transform: [
              { translateY: Animated.subtract(modalY, keyboardHeight) },
            ],
            backgroundColor: '#ffffff',
            width: '100%',
            height: height * 0.36,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          {/* 댓글 목록 */}
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  marginBottom: 12,
                }}
              >
                <Image
                  source={{ uri: item.userImg }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    marginRight: 12,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                      style={{
                        color: '#333',
                        fontWeight: 'bold',
                        marginRight: 8,
                      }}
                    >
                      {item.userName}
                    </Text>
                    <Text style={{ color: '#777', fontSize: 12 }}>
                      {item.registeredAt}
                    </Text>
                  </View>
                  {editingCommentId === item.id ? (
                    <TextInput
                      style={{
                        color: '#333',
                        borderBottomWidth: 1,
                        borderBottomColor: '#ccc',
                      }}
                      value={editedText}
                      onChangeText={setEditedText}
                      autoFocus
                      onBlur={handleUpdateComment}
                    />
                  ) : (
                    <Text style={{ color: '#333' }}>{item.comment}</Text>
                  )}
                </View>
                {loggedInUserName === item.userName && (
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                      onPress={() => handleEditComment(item.id, item.comment)}
                    >
                      <Ionicons name="pencil-outline" size={20} color="gray" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteComment(item.id)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="gray"
                        style={{ marginLeft: 8 }}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          />

          {/* 댓글 입력창 */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f1f1f1',
                padding: 12,
                borderRadius: 24,
                marginTop: 8,
              }}
            >
              <Ionicons name="person-circle-outline" size={28} color="gray" />
              <TextInput
                style={{ flex: 1, color: '#333', marginLeft: 8 }}
                placeholder="댓글 추가..."
                placeholderTextColor="gray"
                value={comment}
                onChangeText={setComment}
              />
              <TouchableOpacity
                disabled={!comment.trim()}
                onPress={handleCommentSubmit}
              >
                <Ionicons
                  name="send"
                  size={24}
                  color={comment.trim() ? '#ff9900' : 'gray'}
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}
