import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { API_ENDPOINTS } from '@/urls/api';
import ModalHeader from '@/components/common/ModalHeader';
import LoadingIndicator from '@/components/common/LoadingIndicator';
import EmptyState from '@/components/common/EmptyState';

interface BalanceEntry {
  from_user_id: number;
  to_user_id: number;
  amount: number;
  from_user: {
    id: number;
    username: string;
    email: string;
  };
  to_user: {
    id: number;
    username: string;
    email: string;
  };
}

interface EventBalance {
  event_id: number;
  balances: BalanceEntry[];
  summary: Record<string, number>;
}

/** Backend (Jackson) zwraca camelCase: fromUser, toUser, fromUserId — mobile wcześniej zakładał snake_case. */
function normalizeBalancePayload(raw: unknown): EventBalance | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as Record<string, unknown>;

  const summary = d.summary;
  const mapSummary: Record<string, number> =
    summary && typeof summary === 'object' && !Array.isArray(summary)
      ? Object.fromEntries(
          Object.entries(summary as Record<string, unknown>).map(([k, v]) => [k, typeof v === 'number' ? v : Number(v)])
        )
      : {};

  const balancesRaw = d.balances;
  const list = Array.isArray(balancesRaw) ? balancesRaw : [];

  const balances: BalanceEntry[] = list.map((entry: unknown) => {
    const e = entry as Record<string, unknown>;
    const fromUser = (e.from_user ?? e.fromUser) as BalanceEntry['from_user'] | undefined;
    const toUser = (e.to_user ?? e.toUser) as BalanceEntry['to_user'] | undefined;
    const amount = typeof e.amount === 'number' ? e.amount : Number(e.amount ?? 0);
    return {
      from_user_id: Number(e.from_user_id ?? e.fromUserId ?? 0),
      to_user_id: Number(e.to_user_id ?? e.toUserId ?? 0),
      amount,
      from_user: fromUser ?? { id: 0, username: '?', email: '' },
      to_user: toUser ?? { id: 0, username: '?', email: '' },
    };
  });

  return {
    event_id: Number(d.event_id ?? d.eventId ?? 0),
    balances,
    summary: mapSummary,
  };
}

interface BalanceParticipant {
  id: number;
  username: string;
}

interface BalanceModalProps {
  visible: boolean;
  onClose: () => void;
  eventId: number;
  /** Do mapowania salda (klucze w summary to userId z backendu). */
  participants?: BalanceParticipant[];
}

export default function BalanceModal({ visible, onClose, eventId, participants = [] }: BalanceModalProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;
  const { authorizedFetch } = useAuth();

  const [balance, setBalance] = useState<EventBalance | null>(null);
  const [loading, setLoading] = useState(false);

  const usernameByUserId = useMemo(() => {
    const m = new Map<string, string>();
    participants.forEach((p) => m.set(String(p.id), p.username));
    return m;
  }, [participants]);

  useEffect(() => {
    if (visible && eventId) {
      fetchBalance();
    }
  }, [visible, eventId]);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const response = await authorizedFetch(API_ENDPOINTS.EXPENSES.BALANCE(eventId));

      if (response.ok) {
        const data = await response.json();
        setBalance(normalizeBalancePayload(data));
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Backend: fromUserId = wierzyciel (+saldo), toUserId = dłużnik (−saldo).
   * Przelew: TO płaci FROM kwotę — strzałka: płatnik → odbiorca.
   */
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


