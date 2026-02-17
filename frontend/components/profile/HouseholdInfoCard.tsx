import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface HouseholdInfoCardProps {
  household: any;
  loading: boolean;
  isAdmin: boolean;
  userPoints: number;
  onShareCode: () => void;
  onManageMembers: () => void;
  onLeave: () => void;
  onDelete: () => void;
  leaving: boolean;
  deleting: boolean;
}

export default function HouseholdInfoCard({
  household,
  loading,
  isAdmin,
  userPoints,
  onShareCode,
  onManageMembers,
  onLeave,
  onDelete,
  leaving,
  deleting,
}: HouseholdInfoCardProps) {
  if (loading) {
    return (
      <View className="py-5">
        <ActivityIndicator size="large" color="#63B995" />
      </View>
    );
  }

  if (!household) {
    return (
      <Text className="text-text-dim dark:text-gray-400 mb-5">
        No active household.
      </Text>
    );
  }

  return (
    <View className="bg-white dark:bg-card-dark rounded-2xl p-5 mb-4 border border-border-light dark:border-gray-700">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <Ionicons name="home" size={24} color="#63B995" />
          <Text className="text-xl font-bold text-text-main dark:text-text-inverted">
            {household.name}
          </Text>
        </View>

        <View className="flex-row items-center bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1.5 rounded-full border border-amber-100 dark:border-amber-800 gap-1.5">
          <Ionicons name="trophy" size={14} color="#F59E0B" />
          <Text className="text-amber-700 dark:text-amber-400 font-bold text-sm">
            {userPoints} pts
          </Text>
        </View>
      </View>

      {/* Increased visibility: dark:bg-gray-500 */}
      <View className="h-px bg-border-light dark:bg-gray-500 my-4" />

      {/* Invite Code */}
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-xs text-text-muted dark:text-gray-500 uppercase tracking-widest">
            Invite Code
          </Text>
          <Text className="text-2xl font-bold text-text-main dark:text-text-inverted mt-1 tracking-[2px]">
            {household.inviteCode}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={onShareCode} 
          className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg"
        >
          <Ionicons name="share-outline" size={20} color="#63B995" />
        </TouchableOpacity>
      </View>

      {/* Increased visibility: dark:bg-gray-500 */}
      <View className="h-px bg-border-light dark:bg-gray-500 my-4" />

      {/* Actions */}
      {isAdmin ? (
        <View className="flex-row gap-2.5">
          <TouchableOpacity
            className="flex-1 bg-gray-800 dark:bg-gray-700 p-3 rounded-xl flex-row items-center justify-center gap-2"
            onPress={onManageMembers}
          >
            <Ionicons name="people-outline" size={20} color="#fff" />
            <Text className="text-white font-bold">Members</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-red-500 dark:bg-red-600 p-3 rounded-xl flex-row items-center justify-center gap-2"
            onPress={onDelete}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="trash-outline" size={20} color="#fff" />
            )}
            <Text className="text-white font-bold">Delete</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          className="w-full bg-red-500 dark:bg-red-600 p-3 rounded-xl flex-row items-center justify-center gap-2"
          onPress={onLeave}
          disabled={leaving}
        >
          {leaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="log-out-outline" size={20} color="#fff" />
          )}
          <Text className="text-white font-bold">Leave Household</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}