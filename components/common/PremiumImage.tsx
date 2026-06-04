import { useCallback, useState } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Image, type ImageContentFit } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import {
  mediaCacheKey,
  mediaImageSource,
  mediaPriority,
  mediaTransitionMs,
  type MediaVariant,
} from "@/lib/mediaImage";
import Skeleton from "@/components/common/Skeleton";

type PremiumImageProps = {
  uri?: string | null;
  width: number | `${number}%`;
  height: number | `${number}%`;
  borderRadius?: number;
  variant?: MediaVariant;
  contentFit?: ImageContentFit;
  style?: StyleProp<ViewStyle>;
  placeholderIcon?: keyof typeof Ionicons.glyphMap;
  showSkeleton?: boolean;
};

export default function PremiumImage({
  uri,
  width,
  height,
  borderRadius = 0,
  variant = "card",
  contentFit = "cover",
  style,
  placeholderIcon = "image-outline",
  showSkeleton = true,
}: PremiumImageProps) {
  const { accessToken } = useAuth();
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const onLoad = useCallback(() => setLoaded(true), []);
  const onError = useCallback(() => {
    setFailed(true);
    setLoaded(true);
  }, []);

  const source = mediaImageSource(uri, accessToken);
  const showPlaceholder = !source || failed;
  const showLoading = showSkeleton && !!source && !failed && !loaded;

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          overflow: "hidden",
        },
        style,
      ]}
    >
      {showLoading && (
        <Skeleton
          width="100%"
          height="100%"
          borderRadius={borderRadius}
          style={StyleSheet.absoluteFill}
        />
      )}

      {showPlaceholder ? (
        <View style={[styles.placeholder, { borderRadius }]}>
          <Ionicons
            name={placeholderIcon}
            size={variant === "hero" ? 40 : variant.includes("avatar") ? 22 : 28}
            color="rgba(255, 185, 13, 0.45)"
          />
        </View>
      ) : (
        <Image
          source={source}
          style={[StyleSheet.absoluteFill, { opacity: loaded ? 1 : 0 }]}
          contentFit={contentFit}
          cachePolicy="memory-disk"
          recyclingKey={mediaCacheKey(uri ?? "", variant)}
          priority={mediaPriority(variant)}
          transition={mediaTransitionMs(variant)}
          allowDownscaling
          onLoad={onLoad}
          onError={onError}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255, 185, 13, 0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
});
