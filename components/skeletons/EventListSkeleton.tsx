import { View, StyleSheet } from "react-native";
import Skeleton from "@/components/common/Skeleton";

const ROW_COUNT = 4;

export default function EventListSkeleton() {
  return (
    <View style={styles.list}>
      {Array.from({ length: ROW_COUNT }).map((_, i) => (
        <View key={i} style={styles.card}>
          <Skeleton width={88} height={88} borderRadius={16} />
          <View style={styles.lines}>
            <Skeleton height={18} borderRadius={8} style={styles.lineWide} />
            <Skeleton height={14} borderRadius={6} style={styles.lineMid} />
            <Skeleton height={12} borderRadius={6} width="40%" />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 14,
    paddingTop: 8,
  },
  card: {
    flexDirection: "row",
    gap: 14,
    padding: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  lines: {
    flex: 1,
    gap: 10,
    justifyContent: "center",
  },
  lineWide: {
    width: "80%",
  },
  lineMid: {
    width: "55%",
  },
});
