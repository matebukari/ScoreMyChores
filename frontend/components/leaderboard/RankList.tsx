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
        contentContainerStyle={styles.flatListContent}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {data.length === 0 ? "No members ranked yet." : ""}
          </Text>
        }
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.listItem,
              item.id === currentUserId && styles.currentUserItem,
            ]}
          >
            {/* Rank Column */}
            <View style={styles.rankContainer}>{getRankIcon(index)}</View>

            {/* User Info Column */}
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <UserAvatar
                  name={item.name}
                  avatar={item.avatar}
                  size={36} // Slightly larger for better visibility
                  color={item.id === currentUserId ? "#63B995" : "#ccc"}
                />
              </View>

              <View style={styles.nameContainer}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    styles.userName,
                    item.id === currentUserId && styles.currentUserName,
                  ]}
                >
                  {item.name} {item.id === currentUserId}
                </Text>
              </View>
            </View>

            {/* Score Column */}
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>{item.score}</Text>
              <Text style={styles.ptsText}> pts</Text>
            </View>
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
    elevation: 10,
    overflow: "hidden", // Ensures content stays within rounded corners
  },
  flatListContent: {
    paddingVertical: 10,
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
    fontSize: 14,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  currentUserItem: {
    backgroundColor: "#f0f9f4",
  },
  // Columns
  rankContainer: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  rankText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  avatarContainer: {
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  currentUserName: {
    color: "#63B995",
    fontWeight: "700",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    minWidth: 60,
    justifyContent: "flex-end",
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#63B995",
  },
  ptsText: {
    fontSize: 12,
    color: "#63B995",
    marginBottom: 2,
    marginLeft: 2,
    fontWeight: "600",
  },
});