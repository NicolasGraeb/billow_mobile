import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ChatMessage } from './types';

interface ChatMessageItemProps {
  message: ChatMessage;
  isOwn: boolean;
}

function ChatMessageItemComponent({ message, isOwn }: ChatMessageItemProps) {
  return (
    <View style={[styles.wrapper, isOwn ? styles.wrapperOwn : styles.wrapperOther]}>
      <View style={[styles.avatar, isOwn ? styles.avatarOwn : styles.avatarOther]}>
        <Text style={styles.avatarText}>
          {message.sender.username ? message.sender.username.charAt(0).toUpperCase() : '?'}
        </Text>
      </View>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        <Text style={[styles.sender, isOwn ? styles.senderOwn : styles.senderOther]}>{message.sender.username}</Text>
        <Text style={styles.content}>{message.content}</Text>
        <Text style={styles.timestamp}>
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  wrapperOther: {
    alignSelf: 'flex-start',
  },
  wrapperOwn: {
    flexDirection: 'row-reverse',
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOwn: {
    backgroundColor: 'rgba(255, 185, 13, 0.3)',
  },
  avatarOther: {
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  bubbleOwn: {
    backgroundColor: '#FFB90D',
    borderTopRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderTopLeftRadius: 4,
  },
  sender: {
    fontWeight: '600',
    fontSize: 12,
  },
  senderOwn: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'right',
  },
  senderOther: {
    color: '#A7B0C0',
  },
  content: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 11,
    color: 'rgba(229, 231, 235, 0.7)',
    textAlign: 'right',
  },
});

export const ChatMessageItem = memo(ChatMessageItemComponent);

