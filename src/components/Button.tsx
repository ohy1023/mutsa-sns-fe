import { TouchableOpacity, Text } from 'react-native';
import { ButtonProps } from '@/types/common';

export function Button({
  title,
  onPress,
  loading,
  color = 'bg-blue-500',
}: ButtonProps) {
  return (
    <TouchableOpacity
      className={`p-3 rounded-md w-full ${loading ? 'bg-gray-400' : color}`}
      onPress={onPress}
      disabled={loading}
    >
      <Text className="text-white text-center">
        {loading ? `${title} 중...` : title}
      </Text>
    </TouchableOpacity>
  );
}
