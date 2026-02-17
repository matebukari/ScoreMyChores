import React from "react";
import { View, Text, Platform } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import LeaderboardToggle from "@/components/leaderboard/LeaderboardToggle";
import TopPodium from "@/components/leaderboard/TopPodium";
import RankList from "@/components/leaderboard/RankList";

import { useLeaderboard } from "@/hooks/useLeaderboard";

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const { leaderboardData, timeFrame, setTimeFrame } = useLeaderboard();

  const insets = useSafeAreaInsets();
  const safeTop =
    insets.top > 0 ? insets.top : Platform.OS === "android" ? 30 : 0;

  return (
    <View
      className="flex-1 bg-background dark:bg-background-dark"
      style={{
        paddingTop: safeTop,
        paddingLeft: insets.left + 20,
        paddingRight: insets.right + 20,
      }}
    >
      {/* Header */}
      <View className="mt-10 mb-5">
        <Text className="text-[28px] font-bold text-text-main dark:text-text-inverted ml-5">
          Leaderboard
        </Text>
      </View>

      {/* Week / Month toggle */}
      <LeaderboardToggle timeFrame={timeFrame} onToggle={setTimeFrame} />

      {/* Top 3 Podium */}
      <TopPodium topThree={leaderboardData.slice(0, 3)} />

      {/* Rank List */}
      <RankList data={leaderboardData} currentUserId={user?.uid} />
    </View>
  );
}