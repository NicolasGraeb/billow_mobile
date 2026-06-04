import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import UserAvatar from '@/components/common/UserAvatar';

import type { ChatMessage } from './types';

interface ChatMessageItemProps {
  message: ChatMessage;
  isOwn: boolean;
}

function ChatMessageItemComponent({ message, isOwn }: ChatMessageItemProps) {
  return (
    <View style={[styles.wrapper, isOwn ? styles.wrapperOwn : styles.wrapperOther]}>
      <UserAvatar size={32} imageUrl={message.sender.avatar_url} showMargin={false} />
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        <Text style={[styles.sender, isOwn ? styles.senderOwn : styles.senderOther]}>
          {message.sender.username}
        </Text>
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
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  bubbleOwn: {
    backgroundColor: 'rgba(255, 185, 13, 0.22)',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomLeftRadius: 4,
  },
  sender: {
    fontSize: 12,
    fontWeight: '700',
  },
  senderOwn: {
    color: '#FFB90D',
  },
  senderOther: {
    color: '#A7B0C0',
  },
  content: {
    color: '#E5E7EB',
    fontSize: 15,
    lineHeight: 20,
  },
  timestamp: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 10,
    alignSelf: 'flex-end',
  },
});

export default memo(ChatMessageItemComponent);
