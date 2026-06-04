import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import PremiumImage from "@/components/common/PremiumImage";

type EventCoverImageProps = {
  imageUrl?: string | null;
  height: number;
  borderRadius?: number;
  variant?: "thumb" | "card" | "hero";
  withBottomScrim?: boolean;
};

export default function EventCoverImage({
  imageUrl,
  height,
  borderRadius = 0,
  variant = "card",
  withBottomScrim = false,
}: EventCoverImageProps) {
  return (
    <View style={[styles.wrap, { height, borderRadius }]}>
      <PremiumImage
        uri={imageUrl}
        width="100%"
        height={height}
        borderRadius={borderRadius}
        variant={variant}
        placeholderIcon="image-outline"
      />
      {withBottomScrim && (
        <LinearGradient
          colors={["transparent", "rgba(10, 9, 6, 0.85)"]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    overflow: "hidden",
  },
});
