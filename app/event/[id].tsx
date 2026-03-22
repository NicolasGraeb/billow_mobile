import { View, StyleSheet, ScrollView, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { API_ENDPOINTS } from '@/urls/api';
import { isEventActive } from '@/utils/eventStatus';
import CreateExpenseModal from '@/components/modals/CreateExpenseModal';
import EditExpenseModal from '@/components/modals/EditExpenseModal';
import AddParticipantModal from '@/components/modals/AddParticipantModal';
import BalanceModal from '@/components/modals/BalanceModal';
import EventHeader from '@/components/events/EventHeader';
import EventCard from '@/components/events/EventCard';
import EventActions from '@/components/events/EventActions';
import ExpensesSection from '@/components/events/ExpensesSection';
import BalanceButton from '@/components/events/BalanceButton';

interface Event {
  id: number;
  name: string;
  description: string | null;
  created_by: number;
  status: string;
  created_at: string;
  finished_at: string | null;
  participants: Array<{
    id: number;
    username: string;
    email: string;
  }>;
  creator: {
    id: number;
    username: string;
    email: string;
  };
}

interface Expense {
  id: number;
  event_id: number;
  payer_id: number;
  amount: number;
  description: string | null;
  created_at: string;
  payer: {
    id: number;
    username: string;
    email: string;
  };
  participants: Array<{
    id: number;
    user_id: number;
    amount: number;
    user: {
      id: number;
      username: string;
      email: string;
    };
  }>;
}

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { authorizedFetch, userId, loading: authLoading } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [showCreateExpenseModal, setShowCreateExpenseModal] = useState(false);
  const [showEditExpenseModal, setShowEditExpenseModal] = useState(false);
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [sortBy, setSortBy] = useState<'amount_asc' | 'amount_desc' | 'date_asc' | 'date_desc'>('date_desc');

  useEffect(() => {
    if (!id || authLoading) return;
    fetchEvent();
    fetchExpenses();
  }, [id, authLoading]);

  const fetchEvent = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await authorizedFetch(API_ENDPOINTS.EVENTS.GET(parseInt(id, 10)));

      if (!response.ok) {
        throw new Error('Nie udało się pobrać eventu');
      }

      const data = await response.json();
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event:', error);
      Alert.alert('Błąd', 'Nie udało się pobrać eventu');
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    if (!id) return;

    setExpensesLoading(true);
    try {
      const response = await authorizedFetch(API_ENDPOINTS.EXPENSES.GET_BY_EVENT(parseInt(id, 10)));

      if (response.ok) {
        const data = await response.json();
        setExpenses(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setExpensesLoading(false);
    }
  };

  const handleFinishEvent = async () => {
    if (!id) return;

    Alert.alert(
      'Zakończ event',
      'Czy na pewno chcesz zakończyć ten event?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Zakończ',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await authorizedFetch(API_ENDPOINTS.EVENTS.FINISH(parseInt(id, 10)), {
                method: 'POST',
              });

              if (response.ok) {
                Alert.alert('Sukces', 'Event został zakończony');
                fetchEvent();
              } else {
                const error = await response.json().catch(() => ({ detail: 'Nie udało się zakończyć eventu' }));
                Alert.alert('Błąd', error.detail || 'Nie udało się zakończyć eventu');
              }
            } catch (error) {
              Alert.alert('Błąd', 'Nie udało się zakończyć eventu');
            }
          },
        },
      ]
    );
  };

  const sortExpenses = (expensesList: Expense[]): Expense[] => {
    const sorted = [...expensesList];

    switch (sortBy) {
      case 'amount_asc':
        return sorted.sort((a, b) => a.amount - b.amount);
      case 'amount_desc':
        return sorted.sort((a, b) => b.amount - a.amount);
      case 'date_asc':
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'date_desc':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      default:
        return sorted;
    }
  };

  const sortedExpenses = sortExpenses(expenses);

  const isCreator = Boolean(event && userId !== null && userId === event.created_by);

  console.log('EventDetail render - loading:', loading, 'event:', !!event, 'id:', id);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFB90D" />
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <ActivityIndicator size="large" color="#FFB90D" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <EventHeader
          onFinishEvent={handleFinishEvent}
          isCreator={isCreator}
          isActive={isEventActive(event.status)}
        />

        <EventCard event={event} />

        {isEventActive(event.status) && (
          <EventActions
            onAddExpense={isEventActive(event.status) ? () => setShowCreateExpenseModal(true) : undefined}
            onAddParticipant={isEventActive(event.status) && isCreator ? () => setShowAddParticipantModal(true) : undefined}
            onOpenChat={() => {
              if (id) {
                router.push(`/event/${id}/chat`);
              }
            }}
            isCreator={isCreator}
          />
        )}

        <ExpensesSection
          expenses={expenses}
          sortedExpenses={sortedExpenses}
          expensesLoading={expensesLoading}
          sortBy={sortBy}
          onSortChange={setSortBy}
          isCreator={isCreator}
          isActive={isEventActive(event.status)}
          onEditExpense={(expense) => {
            setSelectedExpense(expense);
            setShowEditExpenseModal(true);
          }}
        />

        {!expensesLoading && expenses.length > 0 && (
          <BalanceButton onPress={() => setShowBalanceModal(true)} />
        )}
      </ScrollView>

      {userId !== null && event && (
        <>
          <CreateExpenseModal
            visible={showCreateExpenseModal}
            onClose={() => setShowCreateExpenseModal(false)}
            onExpenseCreated={() => {
              fetchExpenses();
              setShowCreateExpenseModal(false);
            }}
            eventId={event.id}
            participants={event.participants}
            currentUserId={userId}
          />
          <EditExpenseModal
            visible={showEditExpenseModal}
            onClose={() => {
              setShowEditExpenseModal(false);
              setSelectedExpense(null);
            }}
            onExpenseUpdated={() => {
              fetchExpenses();
              setShowEditExpenseModal(false);
              setSelectedExpense(null);
            }}
            expense={selectedExpense}
            participants={event.participants}
            currentUserId={userId}
            canDelete={Boolean(isCreator && isEventActive(event.status))}
          />
        </>
      )}

      {event && (
        <>
          <AddParticipantModal
            visible={showAddParticipantModal}
            onClose={() => setShowAddParticipantModal(false)}
            onParticipantAdded={() => {
              fetchEvent();
              setShowAddParticipantModal(false);
            }}
            eventId={event.id}
            currentParticipants={event.participants}
          />
          <BalanceModal
            visible={showBalanceModal}
            onClose={() => setShowBalanceModal(false)}
            eventId={event.id}
            participants={event.participants}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
