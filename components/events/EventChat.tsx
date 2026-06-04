import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { chatApi, normalizeChatMessage } from '@/api/chat';
import { useAuth } from '@/context/AuthContext';
import { useAuthorizedApi } from '@/hooks/useAuthorizedApi';
import { API_ENDPOINTS } from '@/urls/api';
import { ChatInputBar } from './chat/ChatInputBar';
import ChatMessageItem from './chat/ChatMessageItem';
import EmojiPicker from './chat/EmojiPicker';
import type { ChatMessage } from './chat/types';
import { compareMessages } from './chat/utils';

interface EventChatProps {
  eventId: number;
  currentUserId: number;
}

const PAGE_SIZE = 30;
const DEFAULT_INPUT_HEIGHT = 72;
const HEADER_HEIGHT = 46;
const WS_RECONNECT_MS = 3000;

export default function EventChat({ eventId, currentUserId }: EventChatProps) {
  const { accessToken } = useAuth();
  const { fetch: authorizedFetch } = useAuthorizedApi();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [input, setInput] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [inputAreaHeight, setInputAreaHeight] = useState(DEFAULT_INPUT_HEIGHT);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const reachedStartRef = useRef(false);
  const shouldReconnectRef = useRef(true);

  const appendMessages = (incoming: ChatMessage | ChatMessage[], appendToTop = false) => {
    setMessages((prev) => {
      const existingIds = new Set(prev.map((msg) => msg.id));
      const merged = [...prev];
      const items = Array.isArray(incoming) ? incoming : [incoming];
      items.forEach((msg) => {
        if (!existingIds.has(msg.id)) {
          merged.push(msg);
        }
      });
      merged.sort(compareMessages);
      return merged;
    });

    if (!appendToTop) {
      requestAnimationFrame(() => {
        if (autoScroll) {
          listRef.current?.scrollToEnd({ animated: true });
        }
      });
    }
  };

  const fetchMessages = async (options?: { beforeId?: number; appendToTop?: boolean }) => {
    try {
      if (options?.appendToTop) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const normalized = await chatApi.getMessages(authorizedFetch, eventId, {
        beforeId: options?.beforeId,
        limit: PAGE_SIZE,
      });

      if (normalized.length === 0 && options?.appendToTop) {
        reachedStartRef.current = true;
      }
      if (normalized.length > 0) {
        appendMessages(normalized, options?.appendToTop ?? false);
      }
    } catch (err) {
      console.error('[EventChat] fetchMessages error', err);
    } finally {
      if (options?.appendToTop) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  const fetchInitialMessages = async () => {
    reachedStartRef.current = false;
    setMessages([]);
    await fetchMessages();
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: false });
    });
  };

  const clearHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  const setupHeartbeat = () => {
    clearHeartbeat();
    heartbeatRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000);
  };

  const handleWsMessage = (raw: string) => {
    try {
      const payload = JSON.parse(raw) as Record<string, unknown>;
      if (payload.type === 'history') {
        return;
      }
      if (payload.type === 'message' && payload.message) {
        appendMessages(
          normalizeChatMessage(payload.message as Record<string, unknown>)
        );
      }
    } catch (err) {
      console.error('[EventChat] parse message error', err);
    }
  };

  const connectWebSocket = () => {
    if (!accessToken) return;

    const wsUrl = API_ENDPOINTS.EVENTS.CHAT_WEBSOCKET(eventId, accessToken);
    setConnecting(true);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnecting(false);
      setupHeartbeat();
    };

    ws.onmessage = (event) => {
      const data = typeof event.data === 'string' ? event.data : String(event.data);
      handleWsMessage(data);
    };

    ws.onerror = () => {
      console.error('[EventChat] WebSocket error');
      setConnecting(false);
    };

    ws.onclose = () => {
      setConnecting(false);
      clearHeartbeat();
      wsRef.current = null;
      if (!shouldReconnectRef.current) return;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      reconnectTimerRef.current = setTimeout(() => {
        if (shouldReconnectRef.current && accessToken) {
          connectWebSocket();
        }
      }, WS_RECONNECT_MS);
    };
  };

  useEffect(() => {
    shouldReconnectRef.current = true;
    fetchInitialMessages().then(() => connectWebSocket());
    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      clearHeartbeat();
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [eventId, accessToken]);

  const handleSend = () => {
    const trimmed = input.trim();
    const ws = wsRef.current;
    if (!trimmed || ws?.readyState !== WebSocket.OPEN) {
      return;
    }
    ws.send(JSON.stringify({ content: trimmed }));
    setInput('');
    setShowEmojiPicker(false);
    setAutoScroll(true);
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  const handleLoadOlder = () => {
    if (loadingMore || loading || reachedStartRef.current) {
      return;
    }
    const oldest = messages[0];
    if (!oldest) return;
    fetchMessages({ beforeId: oldest.id, appendToTop: true });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

    if (contentOffset.y <= 24) {
      handleLoadOlder();
    }

    const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
    setAutoScroll(distanceFromBottom < 48);
  };

  const canSend = !!input.trim() && wsRef.current?.readyState === WebSocket.OPEN;

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoider}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top + HEADER_HEIGHT}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Czat</Text>
          {(loading || connecting) && <ActivityIndicator size="small" color="#FFB90D" />}
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ChatMessageItem message={item} isOwn={item.sender.id === currentUserId} />
          )}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={() => {
            if (autoScroll) {
              requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
            }
          }}
          ListHeaderComponent={
            loadingMore ? (
              <View style={styles.loaderMore}>
                <ActivityIndicator size="small" color="#FFB90D" />
              </View>
            ) : null
          }
          ListFooterComponent={<View style={{ height: inputAreaHeight + (insets.bottom || 0) + 24 }} />}
          keyboardShouldPersistTaps="handled"
        />

        <EmojiPicker
          visible={showEmojiPicker}
          onSelect={(emoji) => setInput((prev) => `${prev}${emoji}`)}
          onClose={() => setShowEmojiPicker(false)}
        />

        <ChatInputBar
          value={input}
          onChangeText={setInput}
          onSend={handleSend}
          onToggleEmoji={() => setShowEmojiPicker((prev) => !prev)}
          canSend={!!canSend}
          bottomInset={insets.bottom || 0}
          onHeightChange={(nextHeight) => {
            if (Math.abs(nextHeight - inputAreaHeight) > 2) {
              setInputAreaHeight(nextHeight);
            }
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  keyboardAvoider: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  headerTitle: {
    color: '#E5E7EB',
    fontWeight: '700',
    fontSize: 18,
  },
  messagesList: {
    gap: 10,
  },
  loaderMore: {
    paddingVertical: 8,
    alignItems: 'center',
  },
});
