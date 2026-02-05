import React from "react";
import { View, Text, StyleSheet } from "react-native";
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

export default function TopPodium({ topThree }: TopPodiumProps) {
  // Array indices: 0 = 1st Place, 1 = 2nd Place, 2 = 3rd Place
  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  return (
    <View style={styles.podiumContainer}>
      {/* Rank 2 (Left Side) */}
      <View style={styles.podiumItem}>
        {second && (
          <>
            <UserAvatar
              name={second.name}
              avatar={second.avatar}
              size={40}
              color="#ddd"
              style={{ marginBottom: 5, borderWidth: 2, borderColor: '#C0C0C0', borderRadius: 50 }}
            />
            <Text style={styles.podiumName} numberOfLines={1}>{second.name}</Text>
            <Text style={styles.podiumScore}>{second.score}</Text>
            <View style={[styles.bar, { height: 70, backgroundColor: "#C0C0C0" }]} />
            <View style={styles.medalContainer}>
              <Ionicons name="medal" size={20} color="#C0C0C0" />
            </View>
          </>
        )}
      </View>

      {/* Rank 1 (Center) */}
      <View style={styles.podiumItem}>
        {first && (
          <>
            <View style={{ marginBottom: 5 }}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
            </View>
            <UserAvatar
              name={first.name}
              avatar={first.avatar}
              size={40}
              color="#FFD700"
              style={{ marginBottom: 5, borderWidth: 2, borderColor: '#FFD700', borderRadius: 50 }}
            />
            <Text style={styles.podiumName} numberOfLines={1}>{first.name}</Text>
            <Text style={styles.podiumScore}>{first.score}</Text>
            <View style={[styles.bar, { height: 100, backgroundColor: "#FFD700" }]} />
            <View style={styles.medalContainer}>
              <Ionicons name="medal" size={24} color="#FFD700" />
            </View>
          </>
        )}
      </View>

      {/* Rank 3 (Right Side) */}
      <View style={styles.podiumItem}>
        {third && (
          <>
            <View>
              <UserAvatar
                name={third.name}
                avatar={third.avatar}
                size={40}
                color="#CD7F32"
                style={{ marginBottom: 5, borderWidth: 2, borderColor: '#CD7F32', borderRadius: 50 }}
              />
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>{third.name}</Text>
            <Text style={styles.podiumScore}>{third.score}</Text>
            <View style={[styles.bar, { height: 50, backgroundColor: "#CD7F32" }]} />
            <View style={styles.medalContainer}>
              <Ionicons name="medal" size={20} color="#CD7F32" />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  podiumName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
    textAlign: "center",
  },
  podiumScore: { fontSize: 10, color: "#666", marginBottom: 5 },
});