import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Alert, Platform } from "react-native";

export type PickImageOptions = {
  aspect: [number, number];
};

export type PickedImage = {
  uri: string;
  mimeType: string;
  fileName: string;
};

async function ensureMediaPermission(): Promise<boolean> {
  const current = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (current.granted) return true;

  const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (requested.granted) return true;

  Alert.alert(
    "Brak dostępu do galerii",
    "W ustawieniach telefonu zezwól Billow na dostęp do zdjęć, aby dodać obraz."
  );
  return false;
}

async function getImageDimensions(uri: string): Promise<{ width: number; height: number; uri: string }> {
  const info = await ImageManipulator.manipulateAsync(uri, [], {
    format: ImageManipulator.SaveFormat.JPEG,
  });
  return { width: info.width, height: info.height, uri: info.uri };
}

async function cropToAspect(
  uri: string,
  aspect: [number, number],
  knownSize?: { width: number; height: number }
): Promise<string> {
  const [aw, ah] = aspect;
  const targetRatio = aw / ah;

  let width = knownSize?.width;
  let height = knownSize?.height;
  let workingUri = uri;

  if (!width || !height) {
    const dims = await getImageDimensions(uri);
    width = dims.width;
    height = dims.height;
    workingUri = dims.uri;
  }

  const currentRatio = width / height;
  let cropWidth = width;
  let cropHeight = height;
  let originX = 0;
  let originY = 0;

  if (currentRatio > targetRatio) {
    cropWidth = Math.round(height * targetRatio);
    originX = Math.round((width - cropWidth) / 2);
  } else if (currentRatio < targetRatio) {
    cropHeight = Math.round(width / targetRatio);
    originY = Math.round((height - cropHeight) / 2);
  }

  const maxEdge = aspect[0] >= aspect[1] ? 1600 : 900;
  const resizeWidth = cropWidth >= cropHeight ? maxEdge : Math.round(maxEdge * (cropWidth / cropHeight));

  const result = await ImageManipulator.manipulateAsync(
    workingUri,
    [
      {
        crop: {
          originX,
          originY,
          width: cropWidth,
          height: cropHeight,
        },
      },
      { resize: { width: resizeWidth } },
    ],
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
  );

  return result.uri;
}

function normalizeFileMeta(uri: string, asset?: ImagePicker.ImagePickerAsset): Pick<PickedImage, "mimeType" | "fileName"> {
  const mimeType =
    asset?.mimeType ??
    (uri.toLowerCase().includes(".png") ? "image/png" : "image/jpeg");
  const ext = mimeType === "image/png" ? "png" : "jpg";
  const fileName = asset?.fileName?.includes(".") ? asset.fileName : `upload.${ext}`;
  return { mimeType, fileName };
}

function needsProgrammaticCrop(
  asset: ImagePicker.ImagePickerAsset,
  aspect: [number, number]
): boolean {
  if (!asset.width || !asset.height) return true;
  const target = aspect[0] / aspect[1];
  const current = asset.width / asset.height;
  return Math.abs(current - target) > 0.08;
}

export async function pickImageFromLibrary(options: PickImageOptions): Promise<PickedImage | null> {
  if (!(await ensureMediaPermission())) {
    return null;
  }

  let result: ImagePicker.ImagePickerResult;

  try {
    result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: options.aspect,
      quality: 1,
      exif: false,
      ...(Platform.OS === "ios"
        ? { presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN }
        : {}),
    });
  } catch (err) {
    console.warn("[pickImage] launchImageLibraryAsync failed", err);
    Alert.alert("Błąd", "Nie udało się otworzyć galerii. Zrestartuj aplikację po aktualizacji.");
    return null;
  }

  if (result.canceled || !result.assets?.[0]?.uri) {
    return null;
  }

  const asset = result.assets[0];
  let uri = asset.uri;

  try {
    if (needsProgrammaticCrop(asset, options.aspect)) {
      const size =
        asset.width && asset.height
          ? { width: asset.width, height: asset.height }
          : undefined;
      uri = await cropToAspect(uri, options.aspect, size);
    }
  } catch (err) {
    console.warn("[pickImage] crop fallback failed", err);
    Alert.alert("Błąd", "Nie udało się przyciąć zdjęcia.");
    return null;
  }

  try {
    const saved = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 0.85,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    return {
      uri: saved.uri,
      mimeType: "image/jpeg",
      fileName: "upload.jpg",
    };
  } catch (err) {
    console.warn("[pickImage] normalize failed", err);
    const { mimeType, fileName } = normalizeFileMeta(uri, asset);
    return { uri, mimeType, fileName };
  }
}
