import { View, Text, StyleSheet, Platform, FlatList, TextInput, Dimensions, ActivityIndicator } from 'react-native';
import AnimatedPressable from '@/components/common/AnimatedPressable';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useCallback, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSearchUsers } from '@/hooks/users/useSearchUsers';
import SearchUserRow from '@/components/friends/SearchUserRow';

interface SearchUsersProps {
  onSendRequest?: (userId: number) => void;
}

export default function SearchUsers({ onSendRequest }: SearchUsersProps) {
  const { width, height } = Dimensions.get('window');
  const isSmallScreen = width < 375;

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const {
    users,
    loading,
    hasMore,
    loadMore,
    isFetchingNextPage,
  } = useSearchUsers(debouncedQuery);

  const topMargin = isSmallScreen ? 20 : 24;
  const bottomPadding = 30;
  const screenPortion = height * 0.85;
  const calculatedMaxHeight = screenPortion - (topMargin + bottomPadding);

  const containerStyle = [
    styles.container,
    {
      marginHorizontal: isSmallScreen ? 16 : 20,
      marginTop: topMargin,
      maxHeight: calculatedMaxHeight,
      minHeight: calculatedMaxHeight * 0.9,
    },
  ];

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && debouncedQuery.trim().length >= 2) {
      void loadMore();
    }
  }, [loading, hasMore, debouncedQuery, loadMore]);

  return (
    <View style={containerStyle}>
      <BlurView
        intensity={15}
        tint="light"
        style={StyleSheet.absoluteFill}
      />
      
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: Platform.OS === 'android' 
              ? 'rgba(10,9,6,0.5)' 
              : 'rgba(10,9,6,0.35)',
          },
        ]}
      />

      <LinearGradient
        colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.05)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
            borderRadius: 20,
          },
        ]}
      />

      <View style={[styles.content, { flex: 1 }]}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={isSmallScreen ? 18 : 20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={[
                styles.searchInput,
                {
                  fontSize: isSmallScreen ? 14 : 16,
                },
              ]}
              placeholder="Szukaj użytkowników..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <AnimatedPressable
                style={styles.clearButton}
                haptic={false}
                onPress={() => setSearchQuery('')}
              >
                <Ionicons name="close-circle" size={isSmallScreen ? 18 : 20} color="#6B7280" />
              </AnimatedPressable>
            )}
          </View>
        </View>

        {loading && users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#FFB90D" />
          </View>
        ) : users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons 
              name="people-outline" 
              size={isSmallScreen ? 48 : 56} 
              color="#6B7280" 
            />
            <Text style={[
              styles.emptyText,
              {
                fontSize: isSmallScreen ? 13 : 14,
              },
            ]}>
              {debouncedQuery.length >= 2 ? 'Brak wyników' : 'Wpisz min. 2 znaki aby wyszukać'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <SearchUserRow user={item} onSendRequest={onSendRequest} />
            )}
            contentContainerStyle={styles.usersList}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color="#FFB90D" />
                </View>
              ) : null
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  content: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#E5E7EB',
  },
  clearButton: {
    marginLeft: 8,
  },
  usersList: {
    gap: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
