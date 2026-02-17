import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import UserAvatar from "@/components/ui/UserAvatar";
import { User } from "firebase/auth";

interface UserInfoCardProps {
  user: User | null;
  name?: string | null;
  avatar?: string | null;
  role: "admin" | "member";
  onEditName: () => void;
  onEditAvatar: () => void;
}

export default function UserInfoCard({ 
  user, 
  name, 
  avatar, 
  role, 
  onEditName, 
  onEditAvatar 
}: UserInfoCardProps) {
  const displayName = name || user?.displayName || "User";
  const currentAvatar = avatar !== undefined ? avatar : user?.photoURL;

  return (
    <View className="bg-white dark:bg-card-dark p-5 rounded-2xl flex-row items-center mb-6 shadow-sm">
      <View className="relative">
        <UserAvatar
          name={displayName}
          avatar={currentAvatar}
          size={60}
          fontSize={28}
          color="#2196F3"
        />
        <TouchableOpacity 
          className="absolute -bottom-0 -right-1 bg-light-100 w-6 h-6 rounded-full justify-center items-center border-2 border-white dark:border-card-dark"
          onPress={onEditAvatar}
        >
           <Ionicons name="camera" size={14} color="white" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 ml-4">
        <View className="flex-row items-center gap-2">
          <Text className="text-xl font-bold text-text-main dark:text-text-inverted">
            {displayName}
          </Text>
          <TouchableOpacity onPress={onEditName}>
            <Ionicons name="pencil-sharp" size={16} color="#63B995" />
          </TouchableOpacity>
        </View>

        <Text className="text-sm text-text-muted dark:text-gray-400 mt-0.5">
          {user?.email}
        </Text>
        <Text className="text-xs text-text-muted dark:text-gray-500 mt-1 uppercase tracking-wider">
          Role: {role === "admin" ? "Admin" : "Member"}
        </Text>
      </View>
    </View>
  );
}