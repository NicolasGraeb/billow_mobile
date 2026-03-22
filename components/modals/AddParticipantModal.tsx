import { View, Text, StyleSheet, Modal, FlatList, TouchableOpacity, TextInput, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { API_ENDPOINTS } from '@/urls/api';
import ModalHeader from '@/components/common/ModalHeader';

interface User {
  id: number;
  username: string;
  email: string;
}

interface Participant {
  id: number;
  username: string;
  email: string;
}

interface AddParticipantModalProps {
  visible: boolean;
  onClose: () => void;
  onParticipantAdded?: () => void;
  eventId: number;
  currentParticipants: Participant[];
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
  const { authorizedFetch } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingParticipant, setAddingParticipant] = useState<number | null>(null);

  const parseUserList = (payload: unknown): User[] => {
    if (Array.isArray(payload)) return payload;
    if (payload && typeof payload === 'object' && 'content' in payload) {
      const c = (payload as { content?: unknown }).content;
      return Array.isArray(c) ? c : [];
    }
    return [];
  };

  const searchUsers = useCallback(async (query: string) => {
    if (query.length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const response = await authorizedFetch(
        `${API_ENDPOINTS.USERS.SEARCH}?q=${encodeURIComponent(query)}&page=0&size=20`
      );

      if (!response.ok) {
        throw new Error('Nie udało się wyszukać użytkowników');
      }

      const raw = await response.json();
      const list = parseUserList(raw);
      const currentParticipantIds = currentParticipants.map((p) => p.id);
      const filteredData = list.filter((user: User) => !currentParticipantIds.includes(user.id));
      setUsers(filteredData);
    } catch (error) {
      console.error('Error searching users:', error);
      Alert.alert('Błąd', 'Nie udało się wyszukać użytkowników');
    } finally {
      setLoading(false);
    }
  }, [authorizedFetch, currentParticipants]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchUsers(searchQuery);
      } else {
        setUsers([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchUsers]);

  const handleAddParticipant = async (userId: number) => {
    if (addingParticipant === userId) return;

    setAddingParticipant(userId);
    try {
      const response = await authorizedFetch(API_ENDPOINTS.EVENTS.ADD_PARTICIPANT(eventId, userId), {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Nie udało się dodać uczestnika' }));
        throw new Error(error.detail || 'Nie udało się dodać uczestnika');
      }

      // Usuń dodanego użytkownika z listy wyników
      setUsers(prev => prev.filter(u => u.id !== userId));
      
      if (onParticipantAdded) {
        onParticipantAdded();
      }
      
      Alert.alert('Sukces', 'Uczestnik został dodany do eventu');
    } catch (error: any) {
      Alert.alert('Błąd', error.message || 'Nie udało się dodać uczestnika');
    } finally {
      setAddingParticipant(null);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={[
      styles.userItem,
      { padding: isSmallScreen ? 12 : 16 },
    ]}>
      <View style={styles.userInfo}>
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={isSmallScreen ? 20 : 24} color="#FFB90D" />
        </View>
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
          addingParticipant === item.id && styles.addButtonDisabled,
        ]}
        onPress={() => handleAddParticipant(item.id)}
        disabled={addingParticipant === item.id}
      >
        {addingParticipant === item.id ? (
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
                  onPress={() => {
                    setSearchQuery('');
                    setUsers([]);
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


