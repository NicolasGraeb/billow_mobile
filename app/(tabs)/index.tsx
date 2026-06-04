import { Text, StyleSheet, View, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CreateEventModal from '@/components/modals/CreateEventModal';
import AnimatedPressable from '@/components/common/AnimatedPressable';
import ActiveEventCard from '@/components/events/ActiveEventCard';
import EventListSkeleton from '@/components/skeletons/EventListSkeleton';
import { useActiveEvents } from '@/hooks/events/useActiveEvents';
import type { EventDetail } from '@/types/api';

export default function Home() {
  const { userId } = useAuth();
  const router = useRouter();
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;
  const insets = useSafeAreaInsets();

  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    events,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    refetch,
  } = useActiveEvents();

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch])
  );

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      void loadMore();
    }
  }, [loadingMore, hasMore, loading, loadMore]);

  const handleEventPress = useCallback((eventId: number) => {
    router.push(`/event/${eventId}` as `/event/${string}`);
  }, [router]);

  const keyExtractor = useCallback((item: EventDetail) => item.id.toString(), []);

  const renderEventItem = useCallback(
    ({ item }: { item: EventDetail }) => (
      <ActiveEventCard event={item} onPress={() => handleEventPress(item.id)} />
    ),
    [handleEventPress]
  );

  const listHeader = (
    <View style={styles.header}>
      <Text style={[styles.headerTitle, { fontSize: isSmallScreen ? 24 : 28 }]}>Moje eventy</Text>
      <AnimatedPressable style={styles.createButton} onPress={() => setShowCreateModal(true)}>
        <Ionicons name="add" size={isSmallScreen ? 24 : 28} color="#FFFFFF" />
      </AnimatedPressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading ? (
        <View style={[styles.loadingWrap, { paddingHorizontal: 20, paddingTop: 16 }]}>
          {listHeader}
          <EventListSkeleton />
        </View>
      ) : events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={isSmallScreen ? 64 : 80} color="#6B7280" />
          <Text style={[styles.emptyText, { fontSize: isSmallScreen ? 16 : 18 }]}>
            Brak aktywnych eventów
          </Text>
          <Text style={[styles.emptySubtext, { fontSize: isSmallScreen ? 13 : 14 }]}>
            Utwórz nowy event aby zacząć
          </Text>
          {userId !== null && (
            <AnimatedPressable
              style={[
                styles.createActionButton,
                {
                  paddingHorizontal: isSmallScreen ? 18 : 22,
                  paddingVertical: isSmallScreen ? 12 : 14,
                },
              ]}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={isSmallScreen ? 20 : 22} color="#FFFFFF" />
              <Text style={[styles.createActionButtonText, { fontSize: isSmallScreen ? 14 : 15 }]}>
                Nowy event
              </Text>
            </AnimatedPressable>
          )}
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={keyExtractor}
          renderItem={renderEventItem}
          ListHeaderComponent={listHeader}
          contentContainerStyle={[
            styles.eventsList,
            {
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: (isSmallScreen ? 55 : 60) + insets.bottom + 20,
            },
          ]}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#FFB90D" />
              </View>
            ) : null
          }
        />
      )}

      {userId !== null && (
        <CreateEventModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onEventCreated={() => setShowCreateModal(false)}
          currentUserId={userId}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: '#E5E7EB',
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFB90D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFB90D',
    borderRadius: 24,
  },
  createActionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loadingWrap: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    color: '#E5E7EB',
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#6B7280',
  },
  eventsList: {
    gap: 14,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
