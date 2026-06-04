import { View, StyleSheet, Dimensions } from 'react-native';
import UserAvatar from '@/components/common/UserAvatar';
import UserInfo from '@/components/common/UserInfo';

import type { FriendRelation } from '@/types/api';

interface FriendItemProps {
  item: FriendRelation;
  currentUserId?: number;
}

export default function FriendItem({ item, currentUserId }: FriendItemProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;

  const getFriendUser = () => {
    if (!currentUserId) {
      return item.friend || item.user;
    }
    if (item.user && item.friend) {
      if (item.user.id === currentUserId) {
        return item.friend;
      } else if (item.friend.id === currentUserId) {
        return item.user;
      }
      return item.friend;
    }
    return item.user || item.friend;
  };

  const friendUser = getFriendUser();
  if (!friendUser) return null;

  return (
    <View style={[
      styles.friendItem,
      {
        padding: isSmallScreen ? 12 : 16,
      },
    ]}>
      <View style={styles.userInfo}>
        <UserAvatar imageUrl={friendUser.avatar_url} />
        <UserInfo 
          username={friendUser.username}
          email={friendUser.email}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  friendItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
});


