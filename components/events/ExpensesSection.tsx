import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Skeleton from '@/components/common/Skeleton';
import { Ionicons } from '@expo/vector-icons';
import AnimatedPressable from '@/components/common/AnimatedPressable';
import ExpenseCard from './ExpenseCard';

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

interface ExpensesSectionProps {
  expenses: Expense[];
  sortedExpenses: Expense[];
  expensesLoading: boolean;
  sortBy: 'amount_asc' | 'amount_desc' | 'date_asc' | 'date_desc';
  onSortChange: (sortBy: 'amount_asc' | 'amount_desc' | 'date_asc' | 'date_desc') => void;
  isCreator: boolean;
  isActive: boolean;
  onEditExpense: (expense: Expense) => void;
}

export default function ExpensesSection({
  expenses,
  sortedExpenses,
  expensesLoading,
  sortBy,
  onSortChange,
  isCreator,
  isActive,
  onEditExpense,
}: ExpensesSectionProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;

  return (
    <View style={styles.expensesSection}>
      <View style={styles.expensesHeader}>
        <Text style={[
          styles.sectionTitle,
          { fontSize: isSmallScreen ? 18 : 20 },
        ]}>
          Wydatki
        </Text>
        {expenses.length > 0 && (
          <View style={styles.sortButtons}>
            <AnimatedPressable
              style={[
                styles.sortButton,
                (sortBy === 'amount_asc' || sortBy === 'amount_desc') && styles.sortButtonActive,
                { padding: isSmallScreen ? 6 : 8 },
              ]}
              onPress={() => {
                onSortChange(sortBy === 'amount_desc' ? 'amount_asc' : 'amount_desc');
              }}
            >
              <Ionicons 
                name={sortBy === 'amount_desc' ? 'arrow-down' : 'arrow-up'} 
                size={isSmallScreen ? 14 : 16} 
                color={(sortBy === 'amount_asc' || sortBy === 'amount_desc') ? '#FFFFFF' : '#6B7280'} 
              />
              <Text style={[
                styles.sortButtonText,
                (sortBy === 'amount_asc' || sortBy === 'amount_desc') && styles.sortButtonTextActive,
                { fontSize: isSmallScreen ? 11 : 12 },
              ]}>
                Kwota
              </Text>
            </AnimatedPressable>
            <AnimatedPressable
              style={[
                styles.sortButton,
                (sortBy === 'date_asc' || sortBy === 'date_desc') && styles.sortButtonActive,
                { padding: isSmallScreen ? 6 : 8 },
              ]}
              onPress={() => {
                onSortChange(sortBy === 'date_desc' ? 'date_asc' : 'date_desc');
              }}
            >
              <Ionicons 
                name={sortBy === 'date_desc' ? 'arrow-down' : 'arrow-up'} 
                size={isSmallScreen ? 14 : 16} 
                color={(sortBy === 'date_asc' || sortBy === 'date_desc') ? '#FFFFFF' : '#6B7280'} 
              />
              <Text style={[
                styles.sortButtonText,
                (sortBy === 'date_asc' || sortBy === 'date_desc') && styles.sortButtonTextActive,
                { fontSize: isSmallScreen ? 11 : 12 },
              ]}>
                Data
              </Text>
            </AnimatedPressable>
          </View>
        )}
      </View>
      {expensesLoading ? (
        <View style={styles.expensesList}>
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={styles.expenseSkeleton}>
              <Skeleton width={48} height={48} borderRadius={24} />
              <View style={styles.expenseSkeletonLines}>
                <Skeleton height={18} borderRadius={6} style={{ width: '40%' }} />
                <Skeleton height={14} borderRadius={6} style={{ width: '65%' }} />
              </View>
            </View>
          ))}
        </View>
      ) : expenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={isSmallScreen ? 48 : 56} color="#6B7280" />
          <Text style={[
            styles.emptyText,
            { fontSize: isSmallScreen ? 13 : 14 },
          ]}>
            Brak wydatków
          </Text>
        </View>
      ) : (
        <View style={styles.expensesList}>
          {sortedExpenses.map((item) => (
            <ExpenseCard
              key={item.id}
              expense={item}
              isCreator={isCreator}
              isActive={isActive}
              onEdit={onEditExpense}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  expensesSection: {
    gap: 12,
  },
  expensesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#E5E7EB',
    fontWeight: '700',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  sortButtonActive: {
    backgroundColor: '#FFB90D',
  },
  sortButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  sortButtonTextActive: {
    color: '#FFFFFF',
  },
  expenseSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  expenseSkeletonLines: {
    flex: 1,
    gap: 8,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    color: '#6B7280',
  },
  expensesList: {
    gap: 16,
  },
});


