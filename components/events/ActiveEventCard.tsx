import { View, Text, StyleSheet, Dimensions } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AnimatedPressable from "@/components/common/AnimatedPressable";
import UserAvatar from "@/components/common/UserAvatar";
import EventCoverImage from "@/components/events/EventCoverImage";
import type { EventDetail } from "@/types/api";

const THUMB_SIZE = 88;

type ActiveEventCardProps = {
  event: EventDetail;
  onPress: () => void;
};

export default function ActiveEventCard({ event, onPress }: ActiveEventCardProps) {
  const { width } = Dimensions.get("window");
  const isSmallScreen = width < 375;

  return (
    <AnimatedPressable style={styles.card} onPress={onPress}>
      <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.dim]} />

      <View style={styles.row}>
        <View style={[styles.thumbWrap, { width: THUMB_SIZE, height: THUMB_SIZE }]}>
          <EventCoverImage
            imageUrl={event.image_url}
            height={THUMB_SIZE}
            borderRadius={16}
            variant="thumb"
          />
        </View>

        <View style={styles.body}>
          <Text style={[styles.title, { fontSize: isSmallScreen ? 17 : 18 }]} numberOfLines={1}>
            {event.name}
          </Text>

          {event.creator && (
            <View style={styles.creatorRow}>
              <UserAvatar size={22} imageUrl={event.creator.avatar_url} showMargin={false} />
              <Text style={styles.creatorText} numberOfLines={1}>
                {event.creator.username}
              </Text>
            </View>
          )}

          {event.description ? (
            <Text style={styles.desc} numberOfLines={2}>
              {event.description}
            </Text>
          ) : null}

          <View style={styles.footer}>
            <View style={styles.meta}>
              <Ionicons name="people" size={15} color="#FFB90D" />
              <Text style={styles.metaText}>{event.participants?.length ?? 0} uczestników</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.35)" />
          </View>
        </View>
      </View>

      <LinearGradient
        colors={["rgba(255,255,255,0.12)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View pointerEvents="none" style={styles.border} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
    minHeight: 100,
  },
  dim: {
    backgroundColor: "rgba(10, 9, 6, 0.45)",
  },
  border: {
    ...StyleSheet.absoluteFill,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
  },
  row: {
    flexDirection: "row",
    padding: 14,
    gap: 14,
    alignItems: "center",
  },
  thumbWrap: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  body: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  title: {
    color: "#F3F4F6",
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  creatorText: {
    color: "#A7B0C0",
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  desc: {
    color: "#9CA3AF",
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    color: "#FFB90D",
    fontSize: 12,
    fontWeight: "600",
  },
});
