import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AnimatedPressable from "@/components/common/AnimatedPressable";
import UserAvatar from "@/components/common/UserAvatar";
import EventCoverImage from "@/components/events/EventCoverImage";
import { isEventFinished } from "@/utils/eventStatus";
import type { EventDetail } from "@/types/api";

interface EventCardProps {
  event: EventDetail;
  onChangeImage?: () => void;
  imageUploading?: boolean;
  canEditImage?: boolean;
}

export default function EventCard({
  event,
  onChangeImage,
  imageUploading,
  canEditImage,
}: EventCardProps) {
  const { width } = Dimensions.get("window");
  const isSmallScreen = width < 375;
  const coverHeight = isSmallScreen ? 200 : 220;

  return (
    <View style={styles.eventCard}>
      <BlurView intensity={12} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.dim]} />

      <View style={styles.coverSection}>
        <EventCoverImage
          imageUrl={event.image_url}
          height={coverHeight}
          borderRadius={20}
          variant="hero"
          withBottomScrim
        />
        {canEditImage && onChangeImage && (
          <AnimatedPressable
            style={styles.coverEdit}
            onPress={onChangeImage}
            disabled={imageUploading}
          >
            {imageUploading ? (
              <ActivityIndicator color="#0A0906" size="small" />
            ) : (
              <>
                <Ionicons name="camera" size={18} color="#0A0906" />
                <Text style={styles.coverEditText}>Zmień zdjęcie</Text>
              </>
            )}
          </AnimatedPressable>
        )}
      </View>

      <View style={[styles.eventContent, { padding: isSmallScreen ? 18 : 22 }]}>
        <Text style={[styles.eventName, { fontSize: isSmallScreen ? 24 : 28 }]}>{event.name}</Text>
        {event.description && (
          <Text style={[styles.eventDescription, { fontSize: isSmallScreen ? 14 : 16 }]}>
            {event.description}
          </Text>
        )}
        <View style={styles.eventInfo}>
          <View style={styles.infoRow}>
            <UserAvatar size={28} imageUrl={event.creator?.avatar_url} showMargin={false} />
            <Text style={[styles.infoText, { fontSize: isSmallScreen ? 13 : 14 }]}>
              {event.creator.username}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people" size={isSmallScreen ? 16 : 18} color="#FFB90D" />
            <Text style={[styles.infoText, { fontSize: isSmallScreen ? 13 : 14 }]}>
              {event.participants?.length || 0} uczestników
            </Text>
          </View>
          {isEventFinished(event.status) && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Zakończony</Text>
            </View>
          )}
        </View>
      </View>

      <View pointerEvents="none" style={styles.border} />
    </View>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    borderRadius: 20,
    overflow: "hidden",
  },
  dim: {
    backgroundColor: "rgba(10, 9, 6, 0.35)",
  },
  border: {
    ...StyleSheet.absoluteFill,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
  },
  coverSection: {
    position: "relative",
  },
  coverEdit: {
    position: "absolute",
    right: 14,
    bottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFB90D",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  coverEditText: {
    color: "#0A0906",
    fontWeight: "700",
    fontSize: 13,
  },
  eventContent: {
    gap: 12,
    marginTop: -8,
  },
  eventName: {
    color: "#F9FAFB",
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  eventDescription: {
    color: "#A7B0C0",
    lineHeight: 22,
  },
  eventInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 4,
    alignItems: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    color: "#E5E7EB",
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(107, 114, 128, 0.25)",
  },
  statusText: {
    color: "#9CA3AF",
    fontWeight: "600",
    fontSize: 12,
  },
});
