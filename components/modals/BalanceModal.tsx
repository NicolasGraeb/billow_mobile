import { View, Text, StyleSheet, Modal, FlatList, Dimensions } from 'react-native';
import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import ModalHeader from '@/components/common/ModalHeader';
import LoadingIndicator from '@/components/common/LoadingIndicator';
import EmptyState from '@/components/common/EmptyState';
import { useEventBalance } from '@/hooks/expenses/useEventBalance';
import type { BalanceEntry } from '@/types/api';

interface BalanceParticipant {
  id: number;
  username: string;
}

interface BalanceModalProps {
  visible: boolean;
  onClose: () => void;
  eventId: number;
  participants?: BalanceParticipant[];
}

export default function BalanceModal({ visible, onClose, eventId, participants = [] }: BalanceModalProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;

  const { balance, loading } = useEventBalance(eventId, visible);

  const usernameByUserId = useMemo(() => {
    const m = new Map<string, string>();
    participants.forEach((p) => m.set(String(p.id), p.username));
    return m;
  }, [participants]);

  const renderBalanceItem = ({ item }: { item: BalanceEntry }) => {
    const payer = item.to_user;
    const receiver = item.from_user;
    return (
      <View style={[
        styles.balanceItem,
        {
          padding: isSmallScreen ? 12 : 16,
        },
      ]}>
        <View style={styles.balanceRowVertical}>
          <View style={styles.balanceContent}>
            <View style={styles.balanceUserCol}>
              <Text style={styles.balanceRoleLabel}>Płaci</Text>
              <View style={styles.balanceUser}>
                <Ionicons name="arrow-up-circle" size={isSmallScreen ? 18 : 20} color="#EF4444" />
                <Text style={[
                  styles.balanceUsername,
                  { fontSize: isSmallScreen ? 14 : 16 },
                ]} numberOfLines={1}>
                  {payer?.username ?? '?'}
                </Text>
              </View>
            </View>
            <View style={styles.balanceArrow}>
              <Ionicons name="arrow-forward" size={isSmallScreen ? 18 : 20} color="#6B7280" />
            </View>
            <View style={styles.balanceUserCol}>
              <Text style={styles.balanceRoleLabel}>Otrzymuje</Text>
              <View style={styles.balanceUser}>
                <Ionicons name="arrow-down-circle" size={isSmallScreen ? 18 : 20} color="#22C55E" />
                <Text style={[
                  styles.balanceUsername,
                  { fontSize: isSmallScreen ? 14 : 16 },
                ]} numberOfLines={1}>
                  {receiver?.username ?? '?'}
                </Text>
              </View>
            </View>
            <Text style={[
              styles.balanceAmount,
              { fontSize: isSmallScreen ? 15 : 17 },
            ]}>
              {item.amount.toFixed(2)} zł
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ModalHeader title="Podsumowanie" onClose={onClose} />

          <View style={styles.content}>
            {loading ? (
              <LoadingIndicator />
            ) : !balance ? (
              <EmptyState
                icon="information-circle-outline"
                message="Brak danych"
              />
            ) : (
              <>
                {Object.keys(balance.summary).length > 0 && (
                  <View style={styles.summarySection}>
                    <Text style={[
                      styles.sectionTitle,
                      {
                        fontSize: isSmallScreen ? 16 : 18,
                      },
                    ]}>
                      Saldo netto
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                      + = wydałeś więcej niż Twoja część (wierzysz), − = jesteś winien
                    </Text>
                    {Object.entries(balance.summary)
                      .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                      .map(([userIdKey, amount]) => (
                      <View key={userIdKey} style={styles.summaryItem}>
                        <Text style={[
                          styles.summaryUsername,
                          {
                            fontSize: isSmallScreen ? 14 : 16,
                          },
                        ]}>
                          {usernameByUserId.get(userIdKey) ?? `Użytkownik #${userIdKey}`}
                        </Text>
                        <Text style={[
                          styles.summaryAmount,
                          {
                            fontSize: isSmallScreen ? 14 : 16,
                            color: amount >= 0 ? '#22C55E' : '#EF4444',
                          },
                        ]}>
                          {amount >= 0 ? '+' : ''}{amount.toFixed(2)} zł
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.balancesSection}>
                  <Text style={[
                    styles.sectionTitle,
                    {
                      fontSize: isSmallScreen ? 16 : 18,
                    },
                  ]}>
                    Optymalne przelewy ({balance.balances.length})
                  </Text>
                  {balance.balances.length === 0 ? (
                    <EmptyState
                      icon="checkmark-circle-outline"
                      message="Wszystko wyrównane"
                    />
                  ) : (
                    <FlatList
                      data={balance.balances}
                      keyExtractor={(item, index) =>
                        `${item.from_user_id}-${item.to_user_id}-${index}`
                      }
                      renderItem={renderBalanceItem}
                      contentContainerStyle={styles.balancesList}
                      showsVerticalScrollIndicator={false}
                    />
                  )}
                </View>
              </>
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
  summarySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#E5E7EB',
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionSubtitle: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 16,
  },
  balanceRowVertical: {
    width: '100%',
  },
  balanceUserCol: {
    flex: 1,
    minWidth: 0,
  },
  balanceRoleLabel: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  summaryUsername: {
    color: '#E5E7EB',
    fontWeight: '600',
  },
  summaryAmount: {
    fontWeight: '700',
  },
  balancesSection: {
    flex: 1,
  },
  balancesList: {
    gap: 8,
  },
  balanceItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  balanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  balanceUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  balanceUsername: {
    color: '#E5E7EB',
    fontWeight: '600',
    flex: 1,
  },
  balanceArrow: {
    marginHorizontal: 4,
  },
  balanceAmount: {
    color: '#FFB90D',
    fontWeight: '700',
  },
});
