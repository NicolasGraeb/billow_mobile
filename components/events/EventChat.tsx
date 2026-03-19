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
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Client } from '@stomp/stompjs';

import { API_ENDPOINTS } from '@/urls/api';
import { useAuth } from '@/context/AuthContext';
import { ChatInputBar } from './chat/ChatInputBar';
import { ChatMessageItem } from './chat/ChatMessageItem';
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

export default function EventChat({ eventId, currentUserId }: EventChatProps) {
  const { authorizedFetch, accessToken } = useAuth();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [input, setInput] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [inputAreaHeight, setInputAreaHeight] = useState(DEFAULT_INPUT_HEIGHT);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const stompClientRef = useRef<Client | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const reachedStartRef = useRef(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      try {
        if (typeof UIManager.setLayoutAnimationEnabledExperimental === 'function') {
          UIManager.setLayoutAnimationEnabledExperimental(true);
        }
      } catch (err) {
        // no-op
      }
    }
  }, []);

  const appendMessages = (incoming: ChatMessage | ChatMessage[], appendToTop = false) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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

  const normalizeMessage = (m: Record<string, unknown>): ChatMessage => ({
    id: Number(m.id),
    event_id: Number(m.event_id ?? m.eventId),
    sender: {
      id: Number((m.sender as Record<string, unknown>)?.id),
      username: String((m.sender as Record<string, unknown>)?.username ?? ''),
      email: String((m.sender as Record<string, unknown>)?.email ?? ''),
    },
    content: String(m.content ?? ''),
    created_at: String(m.created_at ?? m.createdAt ?? ''),
  });

  const fetchMessages = async (options?: { beforeId?: number; appendToTop?: boolean }) => {
    try {
      if (options?.appendToTop) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams();
      if (options?.beforeId) {
        params.append('before_id', String(options.beforeId));
      }
      params.append('limit', String(PAGE_SIZE));

      const endpoint = `${API_ENDPOINTS.EVENTS.CHAT_MESSAGES(eventId)}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await authorizedFetch(endpoint);

      if (response.ok) {
        const data: ChatMessage[] = await response.json();
        const normalized = Array.isArray(data) ? data.map((m) => normalizeMessage(m as unknown as Record<string, unknown>)) : [];
        if (normalized.length === 0 && options?.appendToTop) {
          reachedStartRef.current = true;
        }
        if (normalized.length > 0) {
          appendMessages(normalized, options?.appendToTop ?? false);
        }
      } else {
        console.warn('[EventChat] history fetch failed', response.status);
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

  const setupHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }
    heartbeatRef.current = setInterval(() => {
      if (stompClientRef.current?.connected) {
        stompClientRef.current.publish({
          destination: `/app/events/${eventId}/chat`,
          body: JSON.stringify({ type: 'ping' }),
        });
      }
    }, 25000);
  };

  const connectStomp = () => {
    if (!accessToken) return;

    const wsUrl = API_ENDPOINTS.EVENTS.CHAT_STOMP_WS(accessToken);

    const client = new Client({
      webSocketFactory: () => new WebSocket(wsUrl),
      connectHeaders: {},
      debug: () => {},
      reconnectDelay: 3000,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 20000,
      onConnect: () => {
        setConnecting(false);
        setupHeartbeat();

        client.subscribe(`/topic/events/${eventId}/chat`, (message) => {
          try {
            const payload = JSON.parse(message.body);
            if (payload.type === 'history') {
              const history: unknown[] = payload.messages ?? [];
              if (history.length > 0) {
                const normalized = history.map((m) => normalizeMessage(m as Record<string, unknown>));
                appendMessages(normalized, true);
              }
            } else if (payload.type === 'message' && payload.message) {
              appendMessages(normalizeMessage(payload.message as Record<string, unknown>));
            }
          } catch (err) {
            console.error('[EventChat] parse message error', err);
          }
        });
      },
      onStompError: (frame) => {
        console.error('[EventChat] STOMP error', frame.headers?.message ?? frame.body);
        setConnecting(false);
      },
      onWebSocketClose: () => {
        setConnecting(false);
        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current);
        }
      },
    });

    stompClientRef.current = client;
    setConnecting(true);
    client.activate();
  };

  useEffect(() => {
    fetchInitialMessages().then(() => connectStomp());
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      stompClientRef.current?.deactivate?.();
      stompClientRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, accessToken]);

  const handleSend = () => {
    const trimmed = input.trim();
    const client = stompClientRef.current;
    if (!trimmed || !client?.connected) {
      return;
    }
    client.publish({
      destination: `/app/events/${eventId}/chat`,
      body: JSON.stringify({ content: trimmed }),
    });
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

  const canSend = !!input.trim() && !!stompClientRef.current?.connected;

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
