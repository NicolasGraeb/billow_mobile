import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import EventDetailSkeleton from '@/components/skeletons/EventDetailSkeleton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
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
import { useEventDetail } from '@/hooks/events/useEventDetail';
import { useExpensesByEvent } from '@/hooks/expenses/useExpensesByEvent';
import { useFinishEvent } from '@/hooks/events/useFinishEvent';
import { useUploadEventImage } from '@/hooks/media/useUploadEventImage';
import type { Expense } from '@/types/api';

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { userId } = useAuth();
  const eventId = id ? parseInt(id, 10) : null;

  const { event, loading } = useEventDetail(eventId);
  const { expenses, loading: expensesLoading } = useExpensesByEvent(eventId);
  const { finishEvent, finishing } = useFinishEvent(eventId ?? 0);
  const { pickAndUpload: pickEventImage, uploading: imageUploading } = useUploadEventImage(eventId ?? 0);

  const [showCreateExpenseModal, setShowCreateExpenseModal] = useState(false);
  const [showEditExpenseModal, setShowEditExpenseModal] = useState(false);
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [sortBy, setSortBy] = useState<'amount_asc' | 'amount_desc' | 'date_asc' | 'date_desc'>('date_desc');

  const handleFinishEvent = () => {
    if (!eventId) return;

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
              await finishEvent();
              Alert.alert('Sukces', 'Event został zakończony');
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Nie udało się zakończyć eventu';
              Alert.alert('Błąd', message);
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

  if (loading || !event) {
    return <EventDetailSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <EventHeader
          onFinishEvent={finishing ? () => {} : handleFinishEvent}
          isCreator={isCreator}
          isActive={isEventActive(event.status)}
        />

        <EventCard
          event={event}
          canEditImage={isCreator && isEventActive(event.status)}
          onChangeImage={isCreator ? () => void pickEventImage() : undefined}
          imageUploading={imageUploading}
        />

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
            onExpenseCreated={() => setShowCreateExpenseModal(false)}
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
            onParticipantAdded={() => setShowAddParticipantModal(false)}
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
