import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useHousehold } from "@/context/HouseholdContext";
import UserAvatar from "@/components/ui/UserAvatar";

interface ChoreItemProps {
  item: any;
  onPress: (item: any) => void;
}

export default function ChoreItem({ item, onPress }: ChoreItemProps) {
  const { user } = useAuth();
  const { memberProfiles } = useHousehold();

  const getLiveProfile = (
    userId: string | null | undefined,
    snapshotName: string,
    snapshotAvatar: string,
  ) => {
    const liveUser = userId ? memberProfiles[userId] : null;
    return {
      name: liveUser?.displayName || snapshotName || "Unknown",
      avatar: liveUser?.photoURL || snapshotAvatar || null,
    };
  };

  const getDisplayName = (id?: string | null, name?: string | null) => {
    if (id === user?.uid) return "You";
    return name || "Member";
  };

  const isLocked = (() => {
    if (item.inProgress && item.inProgressBy !== user?.uid) return true;
    if (item.completed && item.completedBy !== user?.uid) return true;
    return false;
  })();

  return (
    <TouchableOpacity
      style={[
        styles.choreItem,
        item.completed && {
          backgroundColor: "#f0fff4",
          borderColor: "transparent",
        },
        item.inProgress && {
          borderColor: "#4A90E2",
          backgroundColor: "#f8fbff",
        },
        isLocked && { opacity: 0.5 },
      ]}
      onPress={() => onPress(item)}
      disabled={isLocked}
    >
      <View style={styles.choreInfo}>
        <Text
          style={[
            styles.choreText,
            item.completed && styles.completedText,
            item.inProgress && { fontWeight: "bold", color: "#4A90E2" },
          ]}
        >
          {item.title}
        </Text>

        {/* Badge: In Progress */}
        {item.inProgress && (
          <View style={styles.miniBadge}>
            {(() => {
              const worker = getLiveProfile(
                item.inProgressBy,
                item.inProgressByName,
                item.inProgressByAvatar,
              );
              return (
                <>
                  <UserAvatar
                    name={worker.name}
                    avatar={worker.avatar}
                    color="#4A90E2"
                    size={20}
                    fontSize={10}
                  />
                  <Text style={[styles.miniBadgeText, { color: "#4A90E2" }]}>
                    {isLocked
                      ? `${worker.name} is working`
                      : `${getDisplayName(item.inProgressBy, worker.name)} is working`}
                  </Text>
                </>
              );
            })()}
          </View>
        )}

        {/* Badge: Completed */}
        {item.completed && (
          <View style={styles.miniBadge}>
            {(() => {
              const completer = getLiveProfile(
                item.completedBy,
                item.completedByName,
                item.completedByAvatar,
              );
              return (
                <>
                  <UserAvatar
                    name={completer.name}
                    avatar={completer.avatar}
                    color="#4CAF50"
                    size={20}
                    fontSize={10}
                  />
                  <Text style={[styles.miniBadgeText, { color: "#4CAF50" }]}>
                    Done by {getDisplayName(item.completedBy, completer.name)}
                  </Text>
                </>
              );
            })()}
          </View>
        )}
      </View>

      <View style={styles.choreAction}>
        {!item.completed && (
          <Text
            style={[styles.pointsText, item.inProgress && { color: "#4A90E2" }]}
          >
            +{item.points} pts
          </Text>
        )}

        <Ionicons
          name={
            item.completed
              ? "checkmark-circle"
              : item.inProgress
                ? "stop-circle-outline"
                : "play-circle-outline"
          }
          size={28}
          color={
            item.completed ? "#4CAF50" : item.inProgress ? "#4A90E2" : "#ccc"
          }
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  choreItem: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minHeight: 70,
  },
  choreInfo: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    flex: 1,
  },
  choreText: {
    fontSize: 16,
    color: "#333",
    textAlign: "left",
  },
  choreAction: { flexDirection: "row", alignItems: "center" },
  completedText: { textDecorationLine: "line-through", color: "#aaa" },
  pointsText: { fontWeight: "bold", color: "#63B995", marginRight: 12 },
  miniBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 6,
  },
  miniBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
