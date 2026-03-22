import { View, Text, StyleSheet, Platform, FlatList, TouchableOpacity, TextInput, Dimensions, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useCallback, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { API_ENDPOINTS } from '@/urls/api';
import { API_BASE_URL } from '@/urls/urls';
import { SearchUser, useSearchUsers } from '@/hooks/users/useSearchUsers';

type User = SearchUser;

interface FriendshipStatus {
  status: 'none' | 'pending' | 'accepted' | 'rejected';
  friendship_id?: number;
  is_sender?: boolean;
}

interface SearchUsersProps {
  onSendRequest?: (userId: number) => void;
}

export default function SearchUsers({ onSendRequest }: SearchUsersProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;
  const isLargeScreen = width > 414;
  const { accessToken } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const { users, loading, hasMore, search, loadMore: loadMoreUsers, clear } = useSearchUsers();
  const [sendingRequest, setSendingRequest] = useState<number | null>(null);
  const [friendshipStatuses, setFriendshipStatuses] = useState<Record<number, FriendshipStatus>>({});

  const { height } = Dimensions.get('window');
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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2) {
        search(searchQuery, 0, false);
      } else {
        clear();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, search, clear]);

  useEffect(() => {
    users.forEach((user) => {
      if (!friendshipStatuses[user.id]) {
        checkFriendshipStatus(user.id);
      }
    });
  }, [users, friendshipStatuses]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && searchQuery.length >= 2) {
      loadMoreUsers(searchQuery);
    }
  }, [loading, hasMore, searchQuery, loadMoreUsers]);

  const checkFriendshipStatus = async (userId: number) => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/users/friendship-status/${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const status = await response.json();
        setFriendshipStatuses(prev => ({
          ...prev,
          [userId]: status,
        }));
      }
    } catch (error) {
      console.error('Error checking friendship status:', error);
    }
  };

  const handleSendRequest = async (userId: number) => {
    if (!accessToken || sendingRequest === userId) return;

    setSendingRequest(userId);
    try {
      const response = await fetch(API_ENDPOINTS.FRIENDS.REQUEST(userId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Nie udało się wysłać zaproszenia');
      }

      setFriendshipStatuses(prev => ({
        ...prev,
        [userId]: { status: 'pending', is_sender: true },
      }));

      if (onSendRequest) {
        onSendRequest(userId);
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    } finally {
      setSendingRequest(null);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const friendshipStatus = friendshipStatuses[item.id];
    const isPending = friendshipStatus?.status === 'pending' && friendshipStatus?.is_sender;
    const isAccepted = friendshipStatus?.status === 'accepted';

    return (
      <View style={[
        styles.userItem,
        {
          padding: isSmallScreen ? 12 : 16,
        },
      ]}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={isSmallScreen ? 20 : 24} color="#FFB90D" />
          </View>
          <View style={styles.userDetails}>
            <Text style={[
              styles.username,
              {
                fontSize: isSmallScreen ? 15 : 16,
              },
            ]} numberOfLines={1}>
              {item.username}
            </Text>
            <Text style={[
              styles.userEmail,
              {
                fontSize: isSmallScreen ? 12 : 13,
              },
            ]} numberOfLines={1}>
              {item.email}
            </Text>
          </View>
        </View>
        {isAccepted ? (
          <View style={styles.statusBadge}>
            <Text style={[
              styles.statusText,
              {
                fontSize: isSmallScreen ? 11 : 12,
              },
            ]}>Znajomy</Text>
          </View>
        ) : isPending ? (
          <View style={styles.statusBadge}>
            <Text style={[
              styles.statusText,
              {
                fontSize: isSmallScreen ? 11 : 12,
              },
            ]}>Wysłane</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.addButton,
              sendingRequest === item.id && styles.addButtonDisabled,
            ]}
            onPress={() => handleSendRequest(item.id)}
            disabled={sendingRequest === item.id}
          >
            {sendingRequest === item.id ? (
              <ActivityIndicator size="small" color="#FFB90D" />
            ) : (
              <Ionicons name="person-add" size={isSmallScreen ? 18 : 20} color="#FFB90D" />
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

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
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setSearchQuery('');
                    clear();
                }}
              >
                <Ionicons name="close-circle" size={isSmallScreen ? 18 : 20} color="#6B7280" />
              </TouchableOpacity>
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
              {searchQuery.length >= 2 ? 'Brak wyników' : 'Wpisz min. 2 znaki aby wyszukać'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderUserItem}
            contentContainerStyle={styles.usersList}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loading && users.length > 0 ? (
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
  userItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 185, 13, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
    gap: 4,
  },
  username: {
    color: '#E5E7EB',
    fontWeight: '600',
  },
  userEmail: {
    color: '#A7B0C0',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 185, 13, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
  },
  statusText: {
    color: '#6B7280',
    fontWeight: '600',
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

