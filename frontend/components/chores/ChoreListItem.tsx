import React from "react";
import { View, Text, TouchableOpacity, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import UserAvatar from "@/components/ui/UserAvatar";
import { useChoreListItem } from "@/hooks/useChoreListItem";

interface ChoreListItemProps {
  item: any;
  currentUserId?: string;
  memberProfiles: Record<string, any>;
  isAdmin: boolean;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ChoreListItem({
  item,
  currentUserId,
  memberProfiles,
  isAdmin,
  onReset,
  onDelete,
}: ChoreListItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  
  const { futureDate, getLiveProfile, getScheduledText } = useChoreListItem(item, memberProfiles);

  const renderStatusBadge = () => {
    const isMe = item.inProgressBy === currentUserId || item.completedBy === currentUserId;

    // Helper to switch avatar/text colors based on theme
    const colors = {
      orange: isDark ? "#FFB74D" : "#E65100", // Light Orange / Dark Orange
      blue: isDark ? "#64B5F6" : "#1565C0",   // Light Blue / Dark Blue
      green: isDark ? "#81C784" : "#2E7D32",  // Light Green / Dark Green
      purple: isDark ? "#BA68C8" : "#7B1FA2", // Light Purple / Dark Purple
    };

    if (item.inProgress && !isMe) {
      const worker = getLiveProfile(item.inProgressBy, item.inProgressByName, item.inProgressByAvatar);
      return (
        <View className="flex-row items-center px-2 py-0.5 rounded-full self-start border gap-1.5 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700">
          <UserAvatar name={worker.name} avatar={worker.avatar} color={colors.orange} size={22} fontSize={10} />
          <Text className="text-[11px] font-semibold text-orange-800 dark:text-orange-300">
            {worker.name} is working
          </Text>
        </View>
      );
    }
    if (item.inProgress && isMe) {
      const worker = getLiveProfile(item.inProgressBy, item.inProgressByName, item.inProgressByAvatar);
      return (
        <View className="flex-row items-center px-2 py-0.5 rounded-full self-start border gap-1.5 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700">
          <UserAvatar name={worker.name} avatar={worker.avatar} color={colors.blue} size={22} fontSize={10} />
          <Text className="text-[11px] font-semibold text-blue-800 dark:text-blue-300">
            Doing Now
          </Text>
        </View>
      );
    }
    if (item.completed && !isMe) {
      const completer = getLiveProfile(item.completedBy, item.completedByName, item.completedByAvatar);
      return (
        <View className="flex-row items-center px-2 py-0.5 rounded-full self-start border gap-1.5 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700">
          <UserAvatar name={completer.name} avatar={completer.avatar} color={colors.green} size={22} fontSize={10} />
          <Text className="text-[11px] font-semibold text-green-800 dark:text-green-300">
            Done by {completer.name}
          </Text>
        </View>
      );
    }
    if (item.completed && isMe) {
      const completer = getLiveProfile(currentUserId || "", item.completedByName, item.completedByAvatar);
      return (
        <View className="flex-row items-center px-2 py-0.5 rounded-full self-start border gap-1.5 bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700">
          <UserAvatar name={completer.name} avatar={completer.avatar} color={colors.purple} size={22} fontSize={10} />
          <Text className="text-[11px] font-semibold text-purple-800 dark:text-purple-300">
            Done by You
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View 
      className={`
        flex-row items-center justify-between p-2.5 rounded-xl mb-2.5 border min-h-[70px]
        ${futureDate 
          ? "bg-background-subtle dark:bg-dark-100/50 border-border-subtle dark:border-gray-700" 
          : "bg-card dark:bg-card-dark border-border-light dark:border-gray-600"
        }
        ${(item.completed || futureDate) ? "opacity-80" : "opacity-100"}
      `}
    >
      {/* Left Content */}
      <View className="flex-1 flex-col justify-center items-start gap-1">
        <Text
          className={`
            text-base font-semibold text-left
            ${item.completed 
              ? "line-through text-text-muted dark:text-gray-400" // INCREASED VISIBILITY
              : "text-text-main dark:text-text-inverted"
            }
            ${futureDate ? "text-text-muted dark:text-gray-400" : ""}
          `}
        >
          {item.title}
        </Text>

        {futureDate ? (
          <View className="flex-row items-center gap-1 mt-0.5">
            <Ionicons name="time-outline" size={14} color="#888" />
            <Text className="text-xs text-text-muted dark:text-gray-400 italic">
              Available at {getScheduledText(futureDate)}
            </Text>
          </View>
        ) : (
          renderStatusBadge()
        )}
      </View>
      
      {/* Right Actions */}
      <View className="flex-row items-center">
        <Text className="mr-4 font-bold text-light-100">
          {item.points} pts
        </Text>
        {isAdmin && (
          <View className="flex-row items-center gap-2.5">
            <TouchableOpacity onPress={() => onReset(item.id)}>
              <Ionicons 
                name="refresh-circle-outline" 
                size={26} 
                color={isDark ? "#64B5F6" : "#2196F3"} 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(item.id)}>
              <Ionicons 
                name="trash-outline" 
                size={22} 
                color={isDark ? "#FF5252" : "#FF5252"} 
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}