import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";

export default function BackgroundGradient() {
  return (
    <>
      <LinearGradient
        colors={["#0A0906", "#0F0E0A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["rgba(255,185,13,0.14)", "transparent"]}
        start={{ x: 0.06, y: 0.0 }}
        end={{ x: 0.6, y: 0.4 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["transparent", "rgba(255,185,13,0.1)"]}
        start={{ x: 0.4, y: 0.7 }}
        end={{ x: 1.0, y: 1.0 }}
        style={StyleSheet.absoluteFill}
      />
    </>
  );
}

