import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useAuth } from "@/context/AuthContext";
import { useHousehold } from "@/context/HouseholdContext";
import UserAvatar from "@/components/ui/UserAvatar";

interface FocusTaskProps {
  task: any;
  onPress: (task: any) => void;
}

export default function FocusTask({ task, onPress }: FocusTaskProps) {
  const { user } = useAuth();
  const { memberProfiles } = useHousehold();
  const { colorScheme } = useColorScheme();

  // Helper to resolve live user data
  const getLiveProfile = (
    userId: string | null | undefined,
    snapshotName: string,
    snapshotAvatar: string,
  ) => {
    const liveUser = userId ? memberProfiles[userId] : null;
    return {
      name: liveUser?.displayName || snapshotName || "Unknown",
      avatar: liveUser?.photoURL || snapshotAvatar || null,
    };
  };

  const getDisplayName = (id?: string | null, name?: string | null) => {
    if (id === user?.uid) return "You";
    return name || "Member";
  };

  const isLocked = (() => {
    if (task.inProgress && task.inProgressBy !== user?.uid) return true;
    if (task.completed && task.completedBy !== user?.uid) return true;
    return false;
  })();

  // 1. Color Logic
  const isDark = colorScheme === "dark";
  const brandColor = "#63B995"; // light-100
  const infoColor = isDark ? "#4A90E2" : "#2196F3"; // Blue for started state

  // Determine active colors based on state
  const activeColor = task.inProgress ? infoColor : brandColor;

  return (
    <View className="mb-6">
      {/* Header Section */}
      <View className="flex-row items-center mb-2 gap-1.5">
        <Ionicons name="rocket" size={18} color={brandColor} />
        <Text
          className="text-xs font-extrabold tracking-widest"
          style={{ color: brandColor }}
        >
          {task.inProgress ? "CURRENTLY WORKING ON" : "PRIORITY TASK"}
        </Text>
      </View>

      {/* Main Card */}
      <TouchableOpacity
        className="bg-card dark:bg-dark-100 p-3 px-4 rounded-2xl border-2 flex-row justify-between items-center shadow-sm"
        style={{ minHeight: 82, borderColor: activeColor }}
        onPress={() => onPress(task)}
        disabled={isLocked}
        activeOpacity={0.7}
      >
        <View className="flex-1 pr-3 justify-center items-start">
          <Text
            className="text-lg font-bold text-text-main dark:text-text-inverted text-left"
            numberOfLines={2}
          >
            {task.title}
          </Text>

          {/* In Progress Badge */}
          {task.inProgress && (
            <View className="flex-row items-center mt-1 gap-1.5">
              {(() => {
                const worker = getLiveProfile(
                  task.inProgressBy,
                  task.inProgressByName,
                  task.inProgressByAvatar,
                );
                return (
                  <>
                    <UserAvatar
                      name={worker.name}
                      avatar={worker.avatar}
                      color={infoColor}
                      size={20}
                      fontSize={10}
                    />
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: infoColor }}
                    >
                      Started by{" "}
                      {getDisplayName(task.inProgressBy, worker.name)}
                    </Text>
                  </>
                );
              })()}
            </View>
          )}
        </View>

        {/* Action Side (Points + Icon) */}
        <View className="flex-row items-center">
          <Text
            className="font-bold mr-3 text-base"
            style={{ color: activeColor }}
          >
            +{task.points} pts
          </Text>
          <Ionicons
            name={
              task.inProgress ? "stop-circle-outline" : "play-circle-outline"
            }
            size={32}
            color={activeColor}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}
