import { memo, useCallback } from 'react';
import { LayoutChangeEvent, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatInputBarProps {
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  onToggleEmoji: () => void;
  canSend: boolean;
  bottomInset: number;
  onHeightChange: (height: number) => void;
}

function ChatInputBarComponent({
  value,
  onChangeText,
  onSend,
  onToggleEmoji,
  canSend,
  bottomInset,
  onHeightChange,
}: ChatInputBarProps) {
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const nextHeight = event.nativeEvent.layout.height;
      onHeightChange(nextHeight);
    },
    [onHeightChange]
  );

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: (Platform.OS === 'ios' ? 12 : 10) + bottomInset,
        },
      ]}
      onLayout={handleLayout}
    >
      <TouchableOpacity style={styles.iconButton} onPress={onToggleEmoji}>
        <Ionicons name="happy-outline" size={22} color="#D1D5DB" />
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Napisz wiadomość..."
        placeholderTextColor="#6B7280"
        value={value}
        onChangeText={onChangeText}
        multiline
        maxLength={500}
      />
      <TouchableOpacity
        style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
        onPress={onSend}
        disabled={!canSend}
      >
        <Ionicons name="send" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  input: {
    flex: 1,
    color: '#E5E7EB',
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFB90D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});

export const ChatInputBar = memo(ChatInputBarComponent);
