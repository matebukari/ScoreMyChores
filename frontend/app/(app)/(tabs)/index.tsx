import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";
import { useChores } from "@/context/ChoreContext";
import { Ionicons } from "@expo/vector-icons";

/**
 * HomeScreen Component
 * The main dashboard that displays user score, the priority "Focus Task",
 * and the full list of daily chores.
 */
export default function HomeScreen() {
  const { user } = useAuth();
  const { chores, updateStatus, loading } = useChores();

  /**
   * Checks if a chore is "Locked" (unavailable to the current user).
   * Prevents users from interfering with tasks started or completed by roommates.
  */
  const isChoreLocked = (chore: any) => {
    // Locked if in-progress by someone else
    if (chore.inProgress && chore.inProgressBy !== user?.uid) return true;
    // Locked if completed by someone else
    if (chore.completed && chore.completedBy !== user?.uid) return true;
    return false;
  };

  /**
   * Handles the tap interaction on any chore card (Focus or List).
   * Toggles status: Pending -> In Progress -> Completed -> Pending.
   * Triggers haptic feedback for better UX.
  */
  const handleChorePress = async (chore: any) => {
    if (isChoreLocked(chore)) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      if (chore.completed) {
        await updateStatus(chore.id, "pending"); // Undo
      } else if (chore.inProgress) {
        await updateStatus(chore.id, "completed"); // Finish
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await updateStatus(chore.id, "in-progress"); // Start
      }
    } catch (error) {
      console.error("Failed to toggle:", error);
    }
  };

  // Calculates total points ONLY for the current logged-in user
  const currentScore = chores
    .filter((c) => c.completed && c.completedBy === user?.uid)
    .reduce((sum, chore) => sum + chore.points, 0);

  // Filters out completed tasks and tasks locked by others to find "Available" work
  const availableChores = chores.filter((c) => {
    if (c.completed) return false;
    if (c.inProgress && c.inProgressBy !== user?.uid) return false;
    return true;
  });

  // Sorts available chores to determine the "Focus Task":
  // Priority 1: Tasks I am already doing.
  // Priority 2: Highest point value.
  const focusTask = availableChores.sort((a, b) => {
    if (a.inProgress && !b.inProgress) return -1;
    if (!a.inProgress && b.inProgress) return 1;
    return b.points - a.points;
  })[0];

  // Date helpers for the weekly streak UI
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const currentDayIndex = new Date().getDay() - 1;

  // Formatting helpers for avatars and names
  const getInitial = (name?: string | null) =>
    name ? name.charAt(0).toUpperCase() : "?";
  const getDisplayName = (id?: string | null, name?: string | null) => {
    if (id === user?.uid) return "You";
    return name || "Member";
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* User Score & Streak */}
      <View style={styles.scoreCard}>
        <Text style={styles.greeting}>Hey, {user?.email?.split("@")[0]}!</Text>
        <Text style={styles.scoreValue}>{currentScore}</Text>

        <View style={styles.streakRow}>
          {weekDays.map((day, index) => (
            <View key={index} style={styles.dayContainer}>
              <View
                style={[
                  styles.dayCircle,
                  index <= currentDayIndex && styles.dayActive,
                  index === currentDayIndex && styles.dayToday,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    index <= currentDayIndex && styles.dayTextActive,
                  ]}
                >
                  {day}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Focus Task (Priority) */}
      {focusTask ? (
        <View style={styles.focusContainer}>
          <View style={styles.focusHeader}>
            <Ionicons name="rocket" size={18} color="#6200ee" />
            <Text style={styles.focusLabel}>
              {focusTask.inProgress ? "CURRENTLY WORKING ON" : "PRIORITY TASK"}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.focusCard,
              focusTask.inProgress && { borderColor: "#4A90E2" },
            ]}
            onPress={() => handleChorePress(focusTask)}
            disabled={isChoreLocked(focusTask)}
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
                {focusTask.title}
              </Text>

              {/* Badge appears if active */}
              {focusTask.inProgress && (
                <View style={styles.miniBadge}>
                  <View
                    style={[styles.miniAvatar, { backgroundColor: "#4A90E2" }]}
                  >
                    <Text style={styles.miniAvatarText}>
                      {getInitial(focusTask.inProgressByName)}
                    </Text>
                  </View>
                  <Text style={[styles.miniBadgeText, { color: "#4A90E2" }]}>
                    Started by{" "}
                    {getDisplayName(
                      focusTask.inProgressBy,
                      focusTask.inProgressByName,
                    )}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.focusAction}>
              <Text style={styles.focusPointsText}>
                +{focusTask.points} pts
              </Text>

              <Ionicons
                name={
                  focusTask.inProgress
                    ? "stop-circle-outline"
                    : "play-circle-outline"
                }
                size={32}
                color={focusTask.inProgress ? "#4A90E2" : "#6200ee"}
              />
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.focusContainer}>
          <Text style={styles.focusLabel}>ALL CAUGHT UP!</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Daily Checklist</Text>

      {/* Full Chore List */}
      <FlatList
        data={chores}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20, color: "#999" }}>
            No chores yet. Add one to get started!
          </Text>
        }
        renderItem={({ item }) => {
          const locked = isChoreLocked(item);

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
                locked && { opacity: 0.5 },
              ]}
              onPress={() => handleChorePress(item)}
              disabled={locked}
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
                    <View
                      style={[
                        styles.miniAvatar,
                        { backgroundColor: "#4A90E2" },
                      ]}
                    >
                      <Text style={styles.miniAvatarText}>
                        {getInitial(item.inProgressByName)}
                      </Text>
                    </View>
                    <Text style={[styles.miniBadgeText, { color: "#4A90E2" }]}>
                      {locked
                        ? `${item.inProgressByName} is working`
                        : `${getDisplayName(item.inProgressBy, item.inProgressByName)} is working`}
                    </Text>
                  </View>
                )}

                {/* Badge: Completed */}
                {item.completed && (
                  <View style={styles.miniBadge}>
                    <View
                      style={[
                        styles.miniAvatar,
                        { backgroundColor: "#4CAF50" },
                      ]}
                    >
                      <Text style={styles.miniAvatarText}>
                        {getInitial(item.completedByName)}
                      </Text>
                    </View>
                    <Text style={[styles.miniBadgeText, { color: "#4CAF50" }]}>
                      Done by{" "}
                      {getDisplayName(item.completedBy, item.completedByName)}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.choreAction}>
                {!item.completed && (
                  <Text
                    style={[
                      styles.pointsText,
                      item.inProgress && { color: "#4A90E2" },
                    ]}
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
                    item.completed
                      ? "#4CAF50"
                      : item.inProgress
                        ? "#4A90E2"
                        : "#ccc"
                  }
                />
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 20 },
  scoreCard: {
    backgroundColor: "#6200ee",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  greeting: { color: "rgba(255,255,255,0.8)", fontSize: 16, marginBottom: 10 },
  scoreValue: { color: "#fff", fontSize: 48, fontWeight: "bold" },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
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
  pointsText: { fontWeight: "bold", color: "#6200ee", marginRight: 12 },
  miniBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 6,
  },
  miniAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  miniAvatarText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  miniBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  streakRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    gap: 8,
  },
  dayContainer: { alignItems: "center" },
  dayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  dayActive: { backgroundColor: "#FFD700" },
  dayToday: { borderWidth: 2, borderColor: "#fff" },
  dayText: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "bold" },
  dayTextActive: { color: "#6200ee" },
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
    color: "#6200ee",
    letterSpacing: 1,
  },
  focusCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#6200ee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#6200ee",
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
    color: "#6200ee",
    marginRight: 12,
    fontSize: 16,
  },
  focusAction: {
    flexDirection: "row",
    alignItems: "center",
  },
});
