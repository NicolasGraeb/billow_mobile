import { View, Text, StyleSheet, Modal, FlatList, TouchableOpacity, TextInput, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import ModalHeader from '@/components/common/ModalHeader';
import UserAvatar from '@/components/common/UserAvatar';
import { useAddParticipant } from '@/hooks/events/useAddParticipant';
import { useParticipantSearch } from '@/hooks/users/useParticipantSearch';
import type { UserSummary } from '@/types/api';

interface AddParticipantModalProps {
  visible: boolean;
  onClose: () => void;
  onParticipantAdded?: () => void;
  eventId: number;
  currentParticipants: UserSummary[];
}

export default function AddParticipantModal({
  visible,
  onClose,
  onParticipantAdded,
  eventId,
  currentParticipants,
}: AddParticipantModalProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const excludeIds = currentParticipants.map((p) => p.id);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const { users, loading } = useParticipantSearch(debouncedQuery, excludeIds, visible);
  const { addParticipant, addingUserId } = useAddParticipant(eventId);

  useEffect(() => {
    if (!visible) {
      setSearchQuery('');
    }
  }, [visible]);

  const handleAddParticipant = async (userId: number) => {
    if (addingUserId === userId) return;

    try {
      await addParticipant(userId);
      onParticipantAdded?.();
      Alert.alert('Sukces', 'Uczestnik został dodany do eventu');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Nie udało się dodać uczestnika';
      Alert.alert('Błąd', message);
    }
  };

  const renderUserItem = ({ item }: { item: UserSummary }) => (
    <View style={[
      styles.userItem,
      { padding: isSmallScreen ? 12 : 16 },
    ]}>
      <View style={styles.userInfo}>
        <UserAvatar size={isSmallScreen ? 40 : 44} imageUrl={item.avatar_url} showMargin={false} />
        <View style={styles.userDetails}>
          <Text style={[
            styles.username,
            { fontSize: isSmallScreen ? 15 : 16 },
          ]} numberOfLines={1}>
            {item.username}
          </Text>
          <Text style={[
            styles.userEmail,
            { fontSize: isSmallScreen ? 12 : 13 },
          ]} numberOfLines={1}>
            {item.email}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.addButton,
          addingUserId === item.id && styles.addButtonDisabled,
        ]}
        onPress={() => handleAddParticipant(item.id)}
        disabled={addingUserId === item.id}
      >
        {addingUserId === item.id ? (
          <ActivityIndicator size="small" color="#FFB90D" />
        ) : (
          <Ionicons name="person-add" size={isSmallScreen ? 18 : 20} color="#FFB90D" />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ModalHeader title="Dodaj uczestnika" onClose={onClose} />

          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={isSmallScreen ? 18 : 20} color="#6B7280" style={styles.searchIcon} />
              <TextInput
                style={[
                  styles.searchInput,
                  { fontSize: isSmallScreen ? 14 : 16 },
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
                  onPress={() => setSearchQuery('')}
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
                { fontSize: isSmallScreen ? 13 : 14 },
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
            />
          )}
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
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
    paddingHorizontal: 20,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 40,
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
  },
});
