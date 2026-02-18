import React from "react";
import { View, Text, TouchableOpacity, Platform, ViewStyle } from "react-native";

interface LeaderboardToggleProps {
  timeFrame: "weekly" | "monthly";
  onToggle: (frame: "weekly" | "monthly") => void;
}

export default function LeaderboardToggle({ timeFrame, onToggle }: LeaderboardToggleProps) {
  // Define shadow style manually to avoid NativeWind race condition
  const activeShadow: ViewStyle = {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  };

  return (
    <View className="flex-row bg-gray-200 dark:bg-gray-600 mx-5 mb-8 rounded-xl p-1">
      <TouchableOpacity
        className={`
          flex-1 py-2.5 items-center rounded-lg
          ${timeFrame === "weekly" ? "bg-white dark:bg-gray-800" : ""}
        `}
        style={timeFrame === "weekly" ? activeShadow : undefined}
        onPress={() => onToggle("weekly")}
      >
        <Text
          className={`
            font-semibold
            ${timeFrame === "weekly" 
              ? "text-light-100" 
              : "text-text-secondary dark:text-gray-400"
            }
          `}
        >
          This Week
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`
          flex-1 py-2.5 items-center rounded-lg
          ${timeFrame === "monthly" ? "bg-white dark:bg-gray-800" : ""}
        `}
        style={timeFrame === "monthly" ? activeShadow : undefined}
        onPress={() => onToggle("monthly")}
      >
        <Text
          className={`
            font-semibold
            ${timeFrame === "monthly" 
              ? "text-light-100" 
              : "text-text-secondary dark:text-gray-400"
            }
          `}
        >
          This Month
        </Text>
      </TouchableOpacity>
    </View>
  );
}