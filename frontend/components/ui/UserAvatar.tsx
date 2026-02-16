import React from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle, Image } from "react-native";
import { Avatars } from "@/constants/avatars";

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
  const borderRadius = size / 2;
  const containerKey = avatar || `initials-${name}`;

  // Handle Image URL (starts with http or https)
  if (avatar && (avatar.startsWith("http") || avatar.startsWith("https"))) {
    return (
      <View
        key={containerKey}
        style={[
          styles.container,
          { width: size, height: size, borderRadius: borderRadius, overflow: "hidden"},
          style
        ]}
      >
        <Image
          source= {{ uri: avatar }}
          style={{ width: size, height: size , borderRadius: borderRadius}}
          resizeMode="cover"
        />
      </View>
    );
  }
  
  // If user has a selected avatar
  if (avatar && Avatars[avatar]) {
    const SvgComponent = Avatars[avatar];
    return (
      <View
        key={containerKey}
        style={[
          styles.container,
          { width: size, height: size, borderRadius: borderRadius, backgroundColor: "transparent" },
          style
        ]}
      >
        <SvgComponent width={size} height={size} />
      </View>
    );
  }

  // Fallback to Initial with colord background
  return (
    <View
      key={containerKey}
      style={[
        styles.container,
        { width: size, height: size, borderRadius: borderRadius, backgroundColor: color },
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