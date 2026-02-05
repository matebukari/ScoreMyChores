import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { useChores } from "@/context/ChoreContext";
import { useAuth } from "@/context/AuthContext";
import { Timestamp } from "firebase/firestore";
import { useHousehold } from "@/context/HouseholdContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import LeaderboardToggle from "@/components/leaderboard/LeaderboardToggle";
import TopPodium from "@/components/leaderboard/TopPodium";
import RankList from "@/components/leaderboard/RankList";

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const { activities } = useChores();
  const { memberProfiles } = useHousehold();
  const [timeFrame, setTimeFrame] = useState<"weekly" | "monthly">("weekly");

  const insets = useSafeAreaInsets();
  const safeTop = insets.top > 0 ? insets.top : (Platform.OS === 'android' ? 30 : 0);

  // Calculate Leaderbooard Data
  const leaderboardData = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();

    // Set the cutoff date based on selection
    if (timeFrame === "weekly") {
      cutoffDate.setDate(now.getDate() - 7);
    } else {
      cutoffDate.setDate(now.getDate() - 30);
    }

    // A map to store scores
    const scores: Record<
      string,
      { name: string; score: number; avatar?: string }
    > = {};

    activities.forEach((activity) => {
      // Only count completed chores
      if (!activity.completedAt) return;

      // Check if it happened within the time frame
      const completedDate =
        activity.completedAt instanceof Timestamp
          ? activity.completedAt.toDate()
          : new Date(activity.completedAt);
      if (completedDate < cutoffDate) return;

      const userId = activity.userId;
      const liveProfile = memberProfiles[userId];
      const displayName =
        liveProfile?.displayName || activity.userName || "Unknown";
      const displayAvatar = liveProfile?.photoURL || activity.userAvatar;

      // If user isn't in the map yet, add them
      if (!scores[userId]) {
        scores[userId] = {
          name: displayName,
          score: 0,
          avatar: displayAvatar,
        };
      } else if (liveProfile) {
        scores[userId].name = displayName;
        scores[userId].avatar = displayAvatar;
      }

      // Add points
      scores[userId].score += activity.points;
    });

    // Convert map to array and sort descending (Highest Score First)
    return Object.entries(scores)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.score - a.score);
  }, [activities, timeFrame, memberProfiles]);

  return (
    <View style={[styles.container,
      { 
        paddingTop: safeTop,
        paddingLeft: insets.left + 20,
        paddingRight: insets.right + 20 
      }
    ]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
      </View>

      {/* Week / Month toggle */}
      <LeaderboardToggle
        timeFrame={timeFrame}
        onToggle={setTimeFrame}
      />

      {/* Top 3 Podium */}
      <TopPodium topThree={leaderboardData.slice(0, 3)} />

      {/* Rank List */}
      <RankList
        data={leaderboardData.slice(3)}
        currentUserId={user?.uid}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: { marginTop: 40, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#333", marginLeft: 20 },
});
