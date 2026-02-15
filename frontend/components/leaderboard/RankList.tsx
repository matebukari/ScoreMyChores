import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import UserAvatar from "@/components/ui/UserAvatar";

interface RankUser {
  id: string;
  name: string;
  score: number;
  avatar?: string;
}

interface RankListProps {
  data: RankUser[];
  currentUserId?: string;
}

export default function RankList({ data, currentUserId }: RankListProps) {
  const getRankIcon = (index: number) => {
    // Rank 1: Gold
    if (index === 0) {
      return <Ionicons name="medal" size={24} color="#FFD700" />;
    }
    // Rank 2: Silver
    if (index === 1) {
      return <Ionicons name="medal" size={24} color="#C0C0C0" />;
    }
    // Rank 3: Bronze
    if (index === 2) {
      return <Ionicons name="medal" size={24} color="#CD7F32" />;
    }
    return <Text style={styles.rankText}>{index + 1}</Text>;
  };

  return (
    <View style={styles.listContainer}>
      <FlatList
        data={data}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#888", marginTop: 20 }}>
            {data.length === 0 ? "No other members ranked yet." : ""}
          </Text>
        }
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.listItem,
              item.id === currentUserId && styles.currentUserItem,
            ]}
          >
            <View style={styles.rankContainer}>{getRankIcon(index)}</View>

            <View style={styles.userInfo}>
              <View style={{ marginRight: 12 }}>
                <UserAvatar
                  name={item.name}
                  avatar={item.avatar}
                  size={32}
                  color={item.id === currentUserId ? "#63B995" : "#ccc"}
                />
              </View>

              <View>
                <Text
                  style={[
                    styles.userName,
                    item.id === currentUserId && { color: "#63B995" },
                  ]}
                >
                  {item.name} {item.id === currentUserId && "(You)"}
                </Text>
              </View>
            </View>

            <Text style={styles.scoreText}>{item.score} pts</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  userName: { fontSize: 16, fontWeight: "600", color: "#333" },
  scoreText: { fontSize: 18, fontWeight: "bold", color: "#63B995" },
});