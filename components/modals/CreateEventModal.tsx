import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, FlatList, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import ModalHeader from '@/components/common/ModalHeader';
import EmptyState from '@/components/common/EmptyState';
import UserAvatar from '@/components/common/UserAvatar';
import UserInfo from '@/components/common/UserInfo';
import { FriendRelation, useFriendsList } from '@/hooks/friends/useFriendsList';
import { useCreateEvent } from '@/hooks/events/useCreateEvent';

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
  onEventCreated?: () => void;
  currentUserId: number;
}

export default function CreateEventModal({ visible, onClose, onEventCreated, currentUserId }: CreateEventModalProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;
  const { friends, loading: friendsLoading } = useFriendsList({ enabled: visible });
  const { createEvent, creating } = useCreateEvent();

  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (visible) {
      setEventName('');
      setDescription('');
      setSelectedFriends(new Set());
    }
  }, [visible]);

  const getFriendUser = (friend: FriendRelation) => {
    if (!currentUserId) {
      return friend.friend || friend.user;
    }
    if (friend.user && friend.friend) {
      if (friend.user.id === currentUserId) {
        return friend.friend;
      } else if (friend.friend.id === currentUserId) {
        return friend.user;
      }
      return friend.friend;
    }
    return friend.user || friend.friend;
  };

  const toggleFriend = (friendId: number) => {
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedFriends(newSelected);
  };

  const handleCreate = async () => {
    if (!eventName.trim()) {
      Alert.alert('Błąd', 'Podaj nazwę eventu');
      return;
    }

    console.log('[CreateEventModal] handleCreate start', {
      currentUserId,
      nameLength: eventName.trim().length,
      selectedFriendsCount: selectedFriends.size,
    });

    try {
      await createEvent({
        name: eventName.trim(),
        description: description.trim() || null,
        participant_ids: Array.from(selectedFriends),
      });

      if (onEventCreated) {
        onEventCreated();
      }
      onClose();
    } catch (error: any) {
      Alert.alert('Błąd', error.message || 'Nie udało się utworzyć eventu');
    }
  };

  const renderFriendItem = ({ item }: { item: FriendRelation }) => {
    const friendUser = getFriendUser(item);
    if (!friendUser) return null;

    const isSelected = selectedFriends.has(friendUser.id);

    return (
      <TouchableOpacity
        style={[
          styles.friendItem,
          isSelected && styles.friendItemSelected,
          {
            padding: isSmallScreen ? 12 : 16,
          },
        ]}
        onPress={() => toggleFriend(friendUser.id)}
      >
        <View style={styles.friendInfo}>
          <View style={styles.checkbox}>
            {isSelected && (
              <Ionicons name="checkmark" size={isSmallScreen ? 18 : 20} color="#FFB90D" />
            )}
          </View>
          <UserAvatar size={isSmallScreen ? 36 : 40} imageUrl={friendUser.avatar_url} showMargin={false} />
          <UserInfo 
            username={friendUser.username}
            email={friendUser.email}
          />
        </View>
      </TouchableOpacity>
    );
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
          <ModalHeader title="Nowy event" onClose={onClose} />

          <View style={styles.content}>
            <View style={styles.inputContainer}>
              <Text style={[
                styles.label,
                {
                  fontSize: isSmallScreen ? 13 : 14,
                },
              ]}>Nazwa eventu *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    fontSize: isSmallScreen ? 14 : 16,
                  },
                ]}
                placeholder="Wpisz nazwę eventu"
                placeholderTextColor="#6B7280"
                value={eventName}
                onChangeText={setEventName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[
                styles.label,
                {
                  fontSize: isSmallScreen ? 13 : 14,
                },
              ]}>Opis (opcjonalnie)</Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    fontSize: isSmallScreen ? 14 : 16,
                  },
                ]}
                placeholder="Wpisz opis"
                placeholderTextColor="#6B7280"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[
                styles.label,
                {
                  fontSize: isSmallScreen ? 13 : 14,
                },
              ]}>Wybierz znajomych</Text>
              {friendsLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FFB90D" />
                </View>
              ) : friends.length === 0 ? (
                <EmptyState
                  icon="people-outline"
                  message="Brak znajomych"
                  iconSize={32}
                  textSize={isSmallScreen ? 12 : 13}
                />
              ) : (
                <View style={styles.friendsListContainer}>
                  <FlatList
                    data={friends}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderFriendItem}
                    contentContainerStyle={styles.friendsList}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                  />
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.createButton, creating && styles.createButtonDisabled]}
              onPress={handleCreate}
              disabled={creating || !eventName.trim()}
            >
              {creating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={[
                  styles.createButtonText,
                  {
                    fontSize: isSmallScreen ? 14 : 16,
                  },
                ]}>Utwórz event</Text>
              )}
            </TouchableOpacity>
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#E5E7EB',
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#E5E7EB',
  },
  textArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#E5E7EB',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  friendsListContainer: {
    maxHeight: 200,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  friendsList: {
    padding: 8,
  },
  friendItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  friendItemSelected: {
    borderColor: '#FFB90D',
    backgroundColor: 'rgba(255, 185, 13, 0.1)',
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#6B7280',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#FFB90D',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

