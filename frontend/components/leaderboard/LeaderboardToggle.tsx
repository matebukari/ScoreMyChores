import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface LeaderboardToggleProps {
  timeFrame: "weekly" | "monthly";
  onToggle: (frame: "weekly" | "monthly") => void;
}

export default function LeaderboardToggle({ timeFrame, onToggle }: LeaderboardToggleProps) {
  return (
    <View style={styles.toggleContainer}>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          timeFrame === "weekly" && styles.activeToggle,
        ]}
        onPress={() => onToggle("weekly")}
      >
        <Text
          style={[
            styles.toggleText,
            timeFrame === "weekly" && styles.activeToggleText,
          ]}
        >
          This Week
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.toggleButton,
          timeFrame === "monthly" && styles.activeToggle,
        ]}
        onPress={() => onToggle("monthly")}
      >
        <Text
          style={[
            styles.toggleText,
            timeFrame === "monthly" && styles.activeToggleText,
          ]}
        >
          This Month
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    margin: 20,
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeToggle: { backgroundColor: "#fff", elevation: 2 },
  toggleText: { fontWeight: "600", color: "#666" },
  activeToggleText: { color: "#63B995" },
});