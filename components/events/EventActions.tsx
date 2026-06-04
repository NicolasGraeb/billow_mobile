import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AnimatedPressable from '@/components/common/AnimatedPressable';

interface EventActionsProps {
  onAddExpense?: () => void;
  onAddParticipant?: () => void;
  onOpenChat?: () => void;
  isCreator: boolean;
}

interface ActionButtonConfig {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  style: object;
}

export default function EventActions({ onAddExpense, onAddParticipant, onOpenChat, isCreator }: EventActionsProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;

  const topButtons: ActionButtonConfig[] = [];

  if (onAddExpense) {
    topButtons.push({
      key: 'expense',
      label: 'Dodaj wydatek',
      icon: 'add-circle',
      onPress: onAddExpense,
      style: styles.primaryButton,
    });
  }

  if (isCreator && onAddParticipant) {
    topButtons.push({
      key: 'participant',
      label: 'Dodaj uczestnika',
      icon: 'person-add',
      onPress: onAddParticipant,
      style: styles.summaryButton,
    });
  }

  if (topButtons.length === 0 && !onOpenChat) {
    return null;
  }

  return (
    <View style={styles.actionsContainer}>
      {topButtons.length > 0 && (
        <View style={[styles.topRow, { flexDirection: isSmallScreen ? 'column' : 'row' }]}>
          {topButtons.map(({ key, label, icon, onPress, style }) => (
            <AnimatedPressable
              key={key}
              style={[styles.actionButton, style, isSmallScreen && styles.stackedButton]}
              onPress={onPress}
            >
              <Ionicons name={icon} size={isSmallScreen ? 20 : 24} color="#FFFFFF" />
              <Text
                style={[
                  styles.actionButtonText,
                  { fontSize: isSmallScreen ? 14 : 16 },
                ]}
              >
                {label}
              </Text>
            </AnimatedPressable>
          ))}
        </View>
      )}

      {onOpenChat && (
        <AnimatedPressable
          style={[styles.actionButton, styles.primaryButton, styles.chatButton]}
          onPress={onOpenChat}
        >
          <Ionicons name="chatbubble-ellipses" size={isSmallScreen ? 20 : 24} color="#FFFFFF" />
          <Text
            style={[
              styles.actionButtonText,
              { fontSize: isSmallScreen ? 14 : 16 },
            ]}
          >
            Otwórz czat
          </Text>
        </AnimatedPressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    gap: 12,
  },
  topRow: {
    gap: 12,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
  },
  primaryButton: {
    backgroundColor: '#FFB90D',
  },
  summaryButton: {
    backgroundColor: '#22C55E',
  },
  chatButton: {
    width: '100%',
  },
  stackedButton: {
    width: '100%',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});


