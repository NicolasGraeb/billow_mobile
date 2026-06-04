import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PremiumImage from "@/components/common/PremiumImage";
import type { MediaVariant } from "@/lib/mediaImage";

interface UserAvatarProps {
  size?: number;
  imageUrl?: string | null;
  showMargin?: boolean;
}

export default function UserAvatar({ size, imageUrl, showMargin = true }: UserAvatarProps) {
  const avatarSize = size ?? 44;
  const iconSize = size ? size * 0.45 : 20;
  const variant: MediaVariant = avatarSize <= 36 ? "avatar-sm" : "avatar";

  return (
    <View
      style={[
        styles.wrap,
        showMargin && styles.withMargin,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
        },
      ]}
    >
      {imageUrl ? (
        <PremiumImage
          uri={imageUrl}
          width={avatarSize}
          height={avatarSize}
          borderRadius={avatarSize / 2}
          variant={variant}
          placeholderIcon="person"
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
        >
          <Ionicons name="person" size={iconSize} color="#FFB90D" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
  },
  withMargin: {
    marginRight: 12,
  },
  fallback: {
    backgroundColor: "rgba(255, 185, 13, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
});
