import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import UserAvatar from "@/components/ui/UserAvatar";

interface PodiumUser {
  id: string;
  name: string;
  score: number;
  avatar?: string;
}

interface TopPodiumProps {
  topThree: PodiumUser[];
}

const GOLD = "#FFD700";
const SILVER = "#C0C0C0";
const BRONZE = "#CD7F32";

export default function TopPodium({ topThree }: TopPodiumProps) {
  // Array indices: 0 = 1st Place, 1 = 2nd Place, 2 = 3rd Place
  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  return (
    <View className="flex-row justify-center items-end h-60 mb-5 mt-5">
      {/* Rank 2 (Left Side) */}
      <View className="items-center w-[90px]">
        {second && (
          <>
            <View className="mb-1.5 border-2 border-silver rounded-full">
              <UserAvatar
                name={second.name}
                avatar={second.avatar}
                size={40}
                color={SILVER}
              />
            </View>
            <Text className="text-[10px] text-text-secondary dark:text-gray-400 mb-1.5 font-bold">
              {second.score} pts
            </Text>
            <View className="w-full h-[70px] bg-silver rounded-t-lg opacity-80" />
            <View className="h-[30px] w-[30px] justify-center items-center mt-1.5">
              <Ionicons name="medal" size={20} color={SILVER} />
            </View>
          </>
        )}
      </View>

      {/* Rank 1 (Center) */}
      <View className="items-center w-[90px] mx-2">
        {first && (
          <>
            <View className="mb-1.5">
              <Ionicons name="trophy" size={24} color={GOLD} />
            </View>
            <View className="mb-1.5 border-2 border-gold rounded-full">
              <UserAvatar
                name={first.name}
                avatar={first.avatar}
                size={48}
                color={GOLD}
              />
            </View>
            <Text className="text-[10px] text-text-secondary dark:text-gray-400 mb-1.5 font-bold">
              {first.score} pts
            </Text>
            <View className="w-full h-[100px] bg-gold rounded-t-lg opacity-90 shadow-sm" />
            <View className="h-[30px] w-[30px] justify-center items-center mt-1.5">
              <Ionicons name="medal" size={24} color={GOLD} />
            </View>
          </>
        )}
      </View>

      {/* Rank 3 (Right Side) */}
      <View className="items-center w-[90px]">
        {third && (
          <>
            <View className="mb-1.5 border-2 border-bronze rounded-full">
              <UserAvatar
                name={third.name}
                avatar={third.avatar}
                size={40}
                color={BRONZE}
              />
            </View>
            <Text className="text-[10px] text-text-secondary dark:text-gray-400 mb-1.5 font-bold">
              {third.score} pts
            </Text>
            <View className="w-full h-[50px] bg-bronze rounded-t-lg opacity-80" />
            <View className="h-[30px] w-[30px] justify-center items-center mt-1.5">
              <Ionicons name="medal" size={20} color={BRONZE} />
            </View>
          </>
        )}
      </View>
    </View>
  );
}