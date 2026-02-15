import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
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
      style={[
        styles.container,
        {
          paddingTop: safeTop,
          paddingLeft: insets.left + 20,
          paddingRight: insets.right + 20,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: { marginTop: 40, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#333", marginLeft: 20 },
});
