import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Skeleton from "@/components/common/Skeleton";

export default function EventDetailSkeleton() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Skeleton width={40} height={40} borderRadius={20} />
          <Skeleton width={80} height={32} borderRadius={12} />
        </View>
        <Skeleton width="100%" height={200} borderRadius={20} />
        <View style={styles.block}>
          <Skeleton height={22} borderRadius={8} style={styles.line70} />
          <Skeleton height={16} borderRadius={6} style={styles.line50} />
          <View style={styles.chips}>
            <Skeleton width={100} height={32} borderRadius={16} />
            <Skeleton width={120} height={32} borderRadius={16} />
          </View>
        </View>
        <Skeleton width="100%" height={56} borderRadius={16} />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} width="100%" height={72} borderRadius={14} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  block: {
    gap: 12,
  },
  line70: {
    width: "70%",
  },
  line50: {
    width: "50%",
  },
  chips: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
});
