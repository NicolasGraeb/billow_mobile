import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import AnimatedPressable from '@/components/common/AnimatedPressable';
import UserAvatar from '@/components/common/UserAvatar';
import { Ionicons } from '@expo/vector-icons';
import { useFriendshipStatus } from '@/hooks/friends/useFriendshipStatus';
import { useSendFriendRequest } from '@/hooks/friends/useSendFriendRequest';
import type { UserSummary } from '@/types/api';

interface SearchUserRowProps {
  user: UserSummary;
  onSendRequest?: (userId: number) => void;
}

export default function SearchUserRow({ user, onSendRequest }: SearchUserRowProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;

  const { status: friendshipStatus } = useFriendshipStatus(user.id);
  const { sendRequest, sendingUserId } = useSendFriendRequest();

  const isPendingSent = friendshipStatus?.status === 'pending' && friendshipStatus?.is_sender;
  const isPendingReceived =
    friendshipStatus?.status === 'pending' && friendshipStatus?.is_sender === false;
  const isAccepted = friendshipStatus?.status === 'accepted';

  const handleSendRequest = async () => {
    if (sendingUserId === user.id) return;
    try {
      await sendRequest(user.id);
      onSendRequest?.(user.id);
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  return (
    <View style={[
      styles.userItem,
      { padding: isSmallScreen ? 12 : 16 },
    ]}>
      <View style={styles.userInfo}>
        <UserAvatar size={isSmallScreen ? 40 : 44} imageUrl={user.avatar_url} showMargin={false} />
        <View style={styles.userDetails}>
          <Text style={[
            styles.username,
            { fontSize: isSmallScreen ? 15 : 16 },
          ]} numberOfLines={1}>
            {user.username}
          </Text>
          <Text style={[
            styles.userEmail,
            { fontSize: isSmallScreen ? 12 : 13 },
          ]} numberOfLines={1}>
            {user.email}
          </Text>
        </View>
      </View>
      {isAccepted ? (
        <View style={styles.statusBadge}>
          <Text style={[
            styles.statusText,
            { fontSize: isSmallScreen ? 11 : 12 },
          ]}>Znajomy</Text>
        </View>
      ) : isPendingSent ? (
        <View style={styles.statusBadge}>
          <Text style={[
            styles.statusText,
            { fontSize: isSmallScreen ? 11 : 12 },
          ]}>Wysłane</Text>
        </View>
      ) : isPendingReceived ? (
        <AnimatedPressable
          style={[
            styles.addButton,
            styles.acceptButton,
            sendingUserId === user.id && styles.addButtonDisabled,
          ]}
          onPress={handleSendRequest}
          disabled={sendingUserId === user.id}
        >
          {sendingUserId === user.id ? (
            <ActivityIndicator size="small" color="#0A0906" />
          ) : (
            <Text style={styles.acceptButtonText}>Zaakceptuj</Text>
          )}
        </AnimatedPressable>
      ) : (
        <AnimatedPressable
          style={[
            styles.addButton,
            sendingUserId === user.id && styles.addButtonDisabled,
          ]}
          onPress={handleSendRequest}
          disabled={sendingUserId === user.id}
        >
          {sendingUserId === user.id ? (
            <ActivityIndicator size="small" color="#FFB90D" />
          ) : (
            <Ionicons name="person-add" size={isSmallScreen ? 18 : 20} color="#FFB90D" />
          )}
        </AnimatedPressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  acceptButton: {
    width: 'auto',
    minWidth: 100,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#FFB90D',
  },
  acceptButtonText: {
    color: '#0A0906',
    fontWeight: '700',
    fontSize: 13,
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
});
