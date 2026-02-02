import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface UserAvatarProps {
  name?: string | null;
  avatar?: string | null;
  size?: number;
  color?: string;
  fontSize?: number;
}

export default function UserAvatar({
  name,
  avatar,
  size = 40,
  color = "#ccc",
  fontSize,
}: UserAvatarProps) {
  const initial = name ? name.charAt(0).toUpperCase() : "?";
  const calculatedFontSize = fontSize || size * 0.45;

  // If user has a selected avatar
  if (avatar) {
    return (
      <View
        style={[
          styles.container,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: "transparent" },
        ]}
      >
        <Text style={{ fontSize: calculatedFontSize * 1.2 }}>{avatar}</Text>
      </View>
    );
  }

  // Fallback to Initial with colord background
  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
      ]}
    >
      <Text style={[styles.text, { fontSize: calculatedFontSize }]}>
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
  },
});