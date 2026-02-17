import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useAuth } from "@/context/AuthContext";
import { useHousehold } from "@/context/HouseholdContext";
import UserAvatar from "@/components/ui/UserAvatar";

interface ChoreItemProps {
  item: any;
  onPress: (item: any) => void;
}

export default function ChoreItem({ item, onPress }: ChoreItemProps) {
  const { user } = useAuth();
  const { memberProfiles } = useHousehold();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

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
    if (item.inProgress && item.inProgressBy !== user?.uid) return true;
    if (item.completed && item.completedBy !== user?.uid) return true;
    return false;
  })();

  // 1. Background & Border Logic
  let backgroundColor = isDark ? "#27272a" : "#FFFFFF"; 
  let borderColor = isDark ? "#3F3F46" : "#E0E0E0";     
  let borderWidth = 2;

  if (item.completed) {
    backgroundColor = isDark ? "#022c22" : "#f0fff4"; 
    borderColor = "transparent";
    borderWidth = 0; 
  } else if (item.inProgress) {
    backgroundColor = isDark ? "#172554" : "#f8fbff"; 
    borderColor = isDark ? "#1e40af" : "#4A90E2";
  }

  // 2. Text Colors
  let titleColor = isDark ? "#FFFFFF" : "#333333";
  let titleDecoration: "none" | "line-through" = "none";
  const doneTextColor = isDark ? "#4ade80" : "#4CAF50"; 

  if (item.completed) {
    titleColor = "#9CA3AF"; 
    titleDecoration = "line-through";
  } else if (item.inProgress) {
    titleColor = isDark ? "#60A5FA" : "#4A90E2"; 
  }

  // 3. Icon Colors
  const statusColor = item.inProgress 
    ? (isDark ? "#60A5FA" : "#4A90E2") 
    : "#63B995"; 

  const iconColor = (() => {
    if (item.completed) return isDark ? "#4ade80" : "#4CAF50"; 
    if (item.inProgress) return isDark ? "#60A5FA" : "#4A90E2";
    return isDark ? "#52525b" : "#CCCCCC"; 
  })();

  return (
    <TouchableOpacity
      className={`p-3 px-4 rounded-2xl flex-row justify-between items-center mb-2 shadow-sm ${isLocked ? 'opacity-50' : ''}`}
      style={{ 
        minHeight: 70, 
        backgroundColor,
        borderColor,
        borderWidth,
      }}
      onPress={() => onPress(item)}
      disabled={isLocked}
    >
      <View className="flex-1 flex-col justify-center items-start">
        {/* Title */}
        <Text 
          className="text-base font-semibold text-left"
          style={{ 
            color: titleColor, 
            textDecorationLine: titleDecoration 
          }}
        >
          {item.title}
        </Text>

        {/* In Progress Badge */}
        {item.inProgress && (
          <View className="flex-row items-center mt-1.5 gap-1.5">
            {(() => {
              const worker = getLiveProfile(
                item.inProgressBy,
                item.inProgressByName,
                item.inProgressByAvatar,
              );
              return (
                <>
                  <UserAvatar
                    name={worker.name}
                    avatar={worker.avatar}
                    color={statusColor}
                    size={20}
                    fontSize={10}
                  />
                  <Text className="text-xs font-semibold" style={{ color: statusColor }}>
                    {item.inProgressBy === user?.uid
                      ? "Doing now"
                      : `${getDisplayName(item.inProgressBy, worker.name)} is working`}
                  </Text>
                </>
              );
            })()}
          </View>
        )}

        {/* Completed Badge */}
        {item.completed && (
          <View className="flex-row items-center mt-1.5 gap-1.5">
            {(() => {
              const completer = getLiveProfile(
                item.completedBy,
                item.completedByName,
                item.completedByAvatar,
              );
              return (
                <>
                  <UserAvatar
                    name={completer.name}
                    avatar={completer.avatar}
                    color={doneTextColor}
                    size={20}
                    fontSize={10}
                  />
                  <Text 
                    className="text-xs font-semibold"
                    style={{ color: doneTextColor }} 
                  >
                    Done by {getDisplayName(item.completedBy, completer.name)}
                  </Text>
                </>
              );
            })()}
          </View>
        )}
      </View>

      {/* Right Side: Points & Icon */}
      <View className="flex-row items-center">
        {!item.completed && (
          <Text
            className="font-bold mr-3 text-sm"
            style={{ color: statusColor }}
          >
            +{item.points} pts
          </Text>
        )}

        <Ionicons
          name={
            item.completed
              ? "checkmark-circle"
              : item.inProgress
                ? "stop-circle-outline"
                : "play-circle-outline"
          }
          size={28}
          color={iconColor}
        />
      </View>
    </TouchableOpacity>
  );
}