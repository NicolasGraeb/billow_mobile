import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface EventHeaderProps {
  onFinishEvent: () => void;
  onChangeImage?: () => void;
  imageUploading?: boolean;
  isCreator: boolean;
  isActive: boolean;
}

export default function EventHeader({
  onFinishEvent,
  onChangeImage,
  imageUploading,
  isCreator,
  isActive,
}: EventHeaderProps) {
  const router = useRouter();
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={isSmallScreen ? 24 : 28} color="#E5E7EB" />
      </TouchableOpacity>
      <View style={styles.actions}>
        {isCreator && isActive && onChangeImage && (
          <TouchableOpacity
            onPress={onChangeImage}
            style={styles.imageButton}
            disabled={imageUploading}
          >
            <Ionicons name="image" size={isSmallScreen ? 22 : 26} color="#FFB90D" />
          </TouchableOpacity>
        )}
        {isCreator && isActive && (
          <TouchableOpacity onPress={onFinishEvent} style={styles.finishButton}>
            <Ionicons name="checkmark-circle" size={isSmallScreen ? 24 : 28} color="#22C55E" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  imageButton: {
    padding: 4,
  },
  finishButton: {
    padding: 4,
  },
});


