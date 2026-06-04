import { View, StyleSheet, FlatList, Modal } from 'react-native';
import ModalHeader from '@/components/common/ModalHeader';
import EmptyState from '@/components/common/EmptyState';
import LoadingIndicator from '@/components/common/LoadingIndicator';
import FriendItem from '@/components/friends/FriendItem';
import { useFriendsList } from '@/hooks/friends/useFriendsList';

interface FriendsListModalProps {
  visible: boolean;
  onClose: () => void;
  currentUserId?: number;
}

export default function FriendsListModal({ visible, onClose, currentUserId }: FriendsListModalProps) {
  const { friends, loading } = useFriendsList({ enabled: visible });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ModalHeader title="Znajomi" onClose={onClose} />

          <View style={styles.content}>
            {loading ? (
              <LoadingIndicator />
            ) : friends.length === 0 ? (
              <EmptyState
                icon="people-outline"
                message="Brak znajomych"
              />
            ) : (
              <FlatList
                data={friends}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <FriendItem item={item} currentUserId={currentUserId} />
                )}
                contentContainerStyle={styles.friendsList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#0A0906',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  friendsList: {
    gap: 8,
    paddingBottom: 20,
  },
});
