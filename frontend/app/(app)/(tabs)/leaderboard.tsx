import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useChores } from "@/context/ChoreContext";
import { useAuth } from "@/context/AuthContext";
import { Timestamp } from "firebase/firestore";
import { useHousehold } from "@/context/HouseholdContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const { activities } = useChores();
  const { memberProfiles } = useHousehold();
  const [timeFrame, setTimeFrame] = useState<"weekly" | "monthly">("weekly");

  const insets = useSafeAreaInsets();

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

  // Helper for Medals
  const getRankIcon = (index: number) => {
    return <Text style={styles.rankText}>{index + 4}</Text>;
  };

  const getInitial = (name: string) =>
    name ? name.charAt(0).toUpperCase() : "?";

  return (
    <View style={[styles.container,
      { 
        paddingTop: insets.top,
        paddingLeft: insets.left + 20,
        paddingRight: insets.right + 20 
      }
    ]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
      </View>

      {/* Week / Month toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            timeFrame === "weekly" && styles.activeToggle,
          ]}
          onPress={() => setTimeFrame("weekly")}
        >
          <Text
            style={[
              styles.toggleText,
              timeFrame === "weekly" && styles.activeToggleText,
            ]}
          >
            This Week
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            timeFrame === "monthly" && styles.activeToggle,
          ]}
          onPress={() => setTimeFrame("monthly")}
        >
          <Text
            style={[
              styles.toggleText,
              timeFrame === "monthly" && styles.activeToggleText,
            ]}
          >
            This Month
          </Text>
        </TouchableOpacity>
      </View>

      {/* CHART HEADER (Top 3 Visual) */}
      <View style={styles.podiumContainer}>
        {/* Rank 2 (Left) */}
        {leaderboardData[1] && (
          <View style={[styles.podiumItem]}>
            <View style={styles.avatarCircle}>
              {leaderboardData[1].avatar ? (
                <Text style={{ fontSize: 20 }}>
                  {leaderboardData[1].avatar}
                </Text>
              ) : (
                <Text style={styles.avatarInitial}>
                  {getInitial(leaderboardData[1].name)}
                </Text>
              )}
            </View>

            <Text style={styles.podiumName}>{leaderboardData[1].name}</Text>
            <Text style={styles.podiumScore}>{leaderboardData[1].score}</Text>
            <View
              style={[styles.bar, { height: 70, backgroundColor: "#C0C0C0" }]}
            />
            {/* Silver Medal Icon */}
            <View style={styles.medalContainer}>
              <Ionicons name="medal" size={20} color="#C0C0C0" />
            </View>
          </View>
        )}

        {/* Rank 1 (Central) */}
        {leaderboardData[0] && (
          <View style={styles.podiumItem}>
            {/* Trophy Icon on Top */}
            <View style={{ marginBottom: 5 }}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
            </View>
            <View
              style={[
                styles.avatarCircle,
                {
                  backgroundColor: "#FFD700",
                  borderWidth: 2,
                  borderColor: "#fff",
                },
              ]}
            >
              {leaderboardData[0].avatar ? (
                <Text style={{ fontSize: 22 }}>
                  {leaderboardData[0].avatar}
                </Text>
              ) : (
                <Text style={[styles.avatarInitial, { color: "#fff" }]}>
                  {getInitial(leaderboardData[0].name)}
                </Text>
              )}
            </View>

            <Text style={styles.podiumName} numberOfLines={1}>
              {leaderboardData[0].name}
            </Text>
            <Text style={styles.podiumScore}>{leaderboardData[0].score}</Text>
            <View
              style={[styles.bar, { height: 100, backgroundColor: "#FFD700" }]}
            />
            {/* Gold Medal Icon */}
            <View style={styles.medalContainer}>
              <Ionicons name="medal" size={24} color="#FFD700" />
            </View>
          </View>
        )}

        {/* Rank 3 (Right) */}
        {leaderboardData[2] && (
          <View style={[styles.podiumItem]}>
            <View style={styles.avatarCircle}>
              {leaderboardData[2].avatar ? (
                <Text style={{ fontSize: 20 }}>
                  {leaderboardData[2].avatar}
                </Text>
              ) : (
                <Text style={styles.avatarInitial}>
                  {getInitial(leaderboardData[2].name)}
                </Text>
              )}
            </View>

            <Text style={styles.podiumName} numberOfLines={1}>
              {leaderboardData[2].name}
            </Text>
            <Text style={styles.podiumScore}>{leaderboardData[2].score}</Text>
            <View
              style={[styles.bar, { height: 50, backgroundColor: "#CD7F32" }]}
            />
            {/* Bronze Medal Icon */}
            <View style={styles.medalContainer}>
              <Ionicons name="medal" size={20} color="#CD7F32" />
            </View>
          </View>
        )}
      </View>

      {/* Rank List */}
      <View style={styles.listContainer}>
        <FlatList
          data={leaderboardData.slice(3)}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            leaderboardData.length <= 3 ? (
              <Text
                style={{ textAlign: "center", color: "#888", marginTop: 20 }}
              >
                {leaderboardData.length === 0
                  ? "No chores completed yet."
                  : "No other members ranked yet."}
              </Text>
            ) : null
          }
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.listItem,
                item.id === user?.uid && styles.currentUserItem,
              ]}
            >
              <View style={styles.rankContainer}>{getRankIcon(index)}</View>

              <View style={styles.userInfo}>
                <View
                  style={[
                    styles.smallAvatar,
                    {
                      backgroundColor: item.avatar
                        ? "transparent"
                        : item.id === user?.uid
                          ? "#6200ee"
                          : "#ccc",
                    },
                  ]}
                >
                  {item.avatar ? (
                    <Text style={{ fontSize: 20 }}>{item.avatar}</Text>
                  ) : (
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>
                      {getInitial(item.name)}
                    </Text>
                  )}
                </View>

                <View>
                  <Text
                    style={[
                      styles.userName,
                      item.id === user?.uid && { color: "#6200ee" },
                    ]}
                  >
                    {item.name} {item.id === user?.uid && "(You)"}
                  </Text>
                </View>
              </View>

              <Text style={styles.scoreText}>{item.score} pts</Text>
            </View>
          )}
        ></FlatList>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", paddingHorizontal: 20 },
  header: { padding: 20, paddingTop: 60, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", color: "#333" },

  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    margin: 20,
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeToggle: { backgroundColor: "#fff", elevation: 2 },
  toggleText: { fontWeight: "600", color: "#666" },
  activeToggleText: { color: "#6200ee" },

  podiumContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    height: 240,
    marginBottom: 20,
    marginTop: 20,
  },
  podiumItem: { alignItems: "center", width: 90 },
  medalContainer: {
    height: 30,
    width: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  bar: {
    width: "100%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    opacity: 0.8,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  avatarInitial: { fontWeight: "bold", color: "#555" },
  podiumName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
    textAlign: "center",
  },
  podiumScore: { fontSize: 10, color: "#666", marginBottom: 5 },

  listContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    elevation: 10,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  currentUserItem: {
    backgroundColor: "#f8fbff",
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  rankContainer: { width: 40, alignItems: "center" },
  rankText: { fontSize: 16, fontWeight: "bold", color: "#666" },
  userInfo: { flex: 1, flexDirection: "row", alignItems: "center" },
  smallAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userName: { fontSize: 16, fontWeight: "600", color: "#333" },
  scoreText: { fontSize: 18, fontWeight: "bold", color: "#6200ee" },
});
