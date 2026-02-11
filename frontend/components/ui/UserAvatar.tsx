import React from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle, Image } from "react-native";

interface UserAvatarProps {
  name?: string | null;
  avatar?: string | null;
  size?: number;
  color?: string;
  fontSize?: number;
  style?: StyleProp<ViewStyle>;
}

export default function UserAvatar({
  name,
  avatar,
  size = 40,
  color = "#ccc",
  fontSize,
  style,
}: UserAvatarProps) {
  const initial = name ? name.charAt(0).toUpperCase() : "?";
  const calculatedFontSize = fontSize || size * 0.45;

  // Handle Image URL (starts with http or https)
  if (avatar && (avatar.startsWith("http") || avatar.startsWith("https"))) {
    return (
      <View
        style={[
          styles.container,
          { width: size, height: size, borderRadius: size / 2, overflow: "hidden"}
        ]}
      >
        <Image
          source= {{ uri: avatar }}
          style={{ width: size, height: size }}
          resizeMode="cover"
        />
      </View>
    );
  }
  
  // If user has a selected avatar
  if (avatar) {
    return (
      <View
        style={[
          styles.container,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: "transparent" },
          style
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
        style
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