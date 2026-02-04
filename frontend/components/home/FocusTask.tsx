import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useHousehold } from "@/context/HouseholdContext";
import UserAvatar from "@/components/ui/UserAvatar";

interface FocusTaskProps {
  task: any;
  onPress: (task: any) => void;
}

export default function FocusTask({ task, onPress }: FocusTaskProps) {
  const { user } = useAuth();
  const { memberProfiles } = useHousehold();

  // Helper to resolve live user data
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
    if (task.inProgress && task.inProgressBy !== user?.uid) return true;
    if (task.completed && task.completedBy !== user?.uid) return true;
    return false;
  })();

  return (
    <View style={styles.focusContainer}>
      <View style={styles.focusHeader}>
        <Ionicons name="rocket" size={18} color="#63B995" />
        <Text style={styles.focusLabel}>
          {task.inProgress ? "CURRENTLY WORKING ON" : "PRIORITY TASK"}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.focusCard,
          task.inProgress && { borderColor: "#4A90E2" },
        ]}
        onPress={() => onPress(task)}
        disabled={isLocked}
      >
        <View
          style={{
            flex: 1,
            paddingRight: 10,
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <Text
            style={[styles.focusTitle, { textAlign: "left" }]}
            numberOfLines={2}
          >
            {task.title}
          </Text>

          {task.inProgress && (
            <View style={styles.miniBadge}>
              {(() => {
                const worker = getLiveProfile(
                  task.inProgressBy,
                  task.inProgressByName,
                  task.inProgressByAvatar,
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
                      Started by{" "}
                      {getDisplayName(task.inProgressBy, worker.name)}
                    </Text>
                  </>
                );
              })()}
            </View>
          )}
        </View>

        <View style={styles.focusAction}>
          <Text style={styles.focusPointsText}>+{task.points} pts</Text>
          <Ionicons
            name={
              task.inProgress ? "stop-circle-outline" : "play-circle-outline"
            }
            size={32}
            color={task.inProgress ? "#4A90E2" : "#63B995"}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  focusContainer: { marginBottom: 25 },
  focusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 5,
  },
  focusLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#63B995",
    letterSpacing: 1,
  },
  focusCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#63B995",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#63B995",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 82,
  },
  focusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  focusPointsText: {
    fontWeight: "bold",
    color: "#63B995",
    marginRight: 12,
    fontSize: 16,
  },
  focusAction: {
    flexDirection: "row",
    alignItems: "center",
  },
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
