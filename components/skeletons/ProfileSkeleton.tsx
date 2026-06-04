import { View, StyleSheet } from "react-native";
import Skeleton from "@/components/common/Skeleton";

export default function ProfileSkeleton() {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Skeleton width={80} height={80} borderRadius={40} />
        <Skeleton height={24} borderRadius={8} style={styles.name} />
        <Skeleton height={14} borderRadius={6} style={styles.email} />
        <View style={styles.stats}>
          <Skeleton width={56} height={40} borderRadius={12} />
          <Skeleton width={100} height={36} borderRadius={12} />
        </View>
      </View>
      <Skeleton width="100%" height={120} borderRadius={20} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 24,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  name: {
    width: "50%",
    marginTop: 8,
  },
  email: {
    width: "65%",
  },
  stats: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
});
