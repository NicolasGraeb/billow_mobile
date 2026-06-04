import { View, StyleSheet, FlatList, Modal } from 'react-native';
import { useState } from 'react';
import ModalHeader from '@/components/common/ModalHeader';
import TabButton from '@/components/common/TabButton';
import EmptyState from '@/components/common/EmptyState';
import LoadingIndicator from '@/components/common/LoadingIndicator';
import ReceivedRequestItem from '@/components/friends/ReceivedRequestItem';
import SentRequestItem from '@/components/friends/SentRequestItem';
import { useFriendRequests } from '@/hooks/friends/useFriendRequests';
import {
  useAcceptFriendRequest,
  useRejectFriendRequest,
} from '@/hooks/friends/useRespondFriendRequest';
import type { FriendRequest } from '@/types/api';

interface FriendRequestsModalProps {
  visible: boolean;
  onClose: () => void;
  onFriendAccepted?: () => void;
}

type TabType = 'received' | 'sent';

export default function FriendRequestsModal({ visible, onClose, onFriendAccepted }: FriendRequestsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('received');

  const { receivedRequests, sentRequests, loading, refetch } = useFriendRequests(visible);
  const { accept, processingId: acceptProcessingId } = useAcceptFriendRequest();
  const { reject, processingId: rejectProcessingId } = useRejectFriendRequest();

  const processing =
    acceptProcessingId ?? rejectProcessingId ?? null;

  const handleAccept = async (friendshipId: number) => {
    if (processing === friendshipId) return;
    try {
      await accept(friendshipId);
      await refetch();
      onFriendAccepted?.();
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleReject = async (friendshipId: number) => {
    if (processing === friendshipId) return;
    try {
      await reject(friendshipId);
      await refetch();
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const currentRequests = activeTab === 'received' 
    ? receivedRequests.filter((req) => req.from_user !== null)
    : sentRequests.filter((req) => req.to_user !== null);

  const renderItem = ({ item }: { item: FriendRequest }) => {
    if (activeTab === 'received') {
      return (
        <ReceivedRequestItem
          item={item}
          processing={processing}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      );
    }
    return <SentRequestItem item={item} />;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ModalHeader title="Zaproszenia" onClose={onClose} />

          <View style={styles.tabs}>
            <TabButton
              label="Otrzymane"
              isActive={activeTab === 'received'}
              onPress={() => setActiveTab('received')}
            />
            <View style={styles.tabGap} />
            <TabButton
              label="Wysłane"
              isActive={activeTab === 'sent'}
              onPress={() => setActiveTab('sent')}
            />
          </View>

          <View style={styles.content}>
            {loading ? (
              <LoadingIndicator />
            ) : currentRequests.length === 0 ? (
              <EmptyState
                icon="mail-outline"
                message={activeTab === 'received' ? 'Brak otrzymanych zaproszeń' : 'Brak wysłanych zaproszeń'}
              />
            ) : (
              <FlatList
                data={currentRequests}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.requestsList}
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  tabGap: {
    width: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  requestsList: {
    gap: 8,
    paddingBottom: 20,
  },
});
