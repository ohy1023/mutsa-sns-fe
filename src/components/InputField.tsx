import { TextInput } from 'react-native';
import { InputFieldProps } from '@/types/common';

export function InputField({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  defaultValue,
  onFocus,
}: InputFieldProps) {
  return (
    <TextInput
      className="border p-3 rounded-md w-full mb-4"
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      value={value}
      onChangeText={onChangeText}
      defaultValue={defaultValue}
      onFocus={onFocus}
    />
  );
}
