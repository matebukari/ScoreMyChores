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
 * The main dashboard for the application. It displays:
 * 1. The user's current score and weekly streak.
 * 2. A "Focus Task" (the highest priority available task for the specific user).
 * 3. A list of all household chores with real-time status updates.
*/
export default function HomeScreen() {
  const { user } = useAuth();
  const { chores, updateStatus, loading } = useChores();

  /**
   * Helper: isChoreLocked
   * Determines if the current user is allowed to interact with a specific chore.
   * Returns `true` (locked) if:
   * 1. Someone else is currently working on it (`inProgressBy` !== me).
   * 2. Someone else has already finished it (`completedBy` !== me).
  */
  const isChoreLocked = (chore: any) => {
    // 1. Locked if someone else is doing it
    if (chore.inProgress && chore.inProgressBy !== user?.uid) return true;
    
    // 2. Locked if someone else completed it
    if (chore.completed && chore.completedBy !== user?.uid) return true;
    
    return false;
  };

  /**
   * Function: handleChorePress
   * Handles the tap interaction on a chore card.
   * - First checks `isChoreLocked` to prevent unauthorized changes.
   * - Cycles the status: Pending -> In Progress -> Completed -> Pending.
   * - Triggers Haptic feedback for better UX.
  */
  const handleChorePress = async (chore: any) => {
    if (isChoreLocked(chore)) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      if (chore.completed) {
        // Undo completion
        await updateStatus(chore.id, "pending");
      } else if (chore.inProgress) {
        // Mark as Done
        await updateStatus(chore.id, "completed");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        // Start working
        await updateStatus(chore.id, "in-progress");
      }
    } catch (error) {
      console.error("Failed to toggle:", error);
    }
  };

  /**
   * Calculation: currentScore
   * Filters the global chore list to calculate points ONLY for the 
  */
  const currentScore = chores
    .filter((c) => c.completed && c.completedBy === user?.uid)
    .reduce((sum, chore) => sum + chore.points, 0)
  ;

  /**
   * Logic: Focus Task Selection
   * Identifies the single most important task for the user to do next.
   * 1. Filters out completed tasks.
   * 2. Filters out tasks locked by roommates (Anti-Stealing).
   * 3. Sorts by: Tasks I started > Highest Points.
  */
  const availableChores = chores.filter((c) => {
    // Exclude completed
    if (c.completed) return false;
    
    // Exclude tasks started by others
    if (c.inProgress && c.inProgressBy !== user?.uid) return false;
    
    return true;
  });

  const focusTask = availableChores.sort((a, b) => {
    // Priority 1: Tasks I am already doing
    if (a.inProgress && !b.inProgress) return -1;
    if (!a.inProgress && b.inProgress) return 1;
    // Priority 2: High point value
    return b.points - a.points;
  })[0];

  // Helpers for Date & Text Formatting
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const currentDayIndex = new Date().getDay() - 1;

  const getInitial = (name?: string | null) => name ? name.charAt(0).toUpperCase() : '?';
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
      {/* Score Card Displays the user's personal score and a visual weekly calendar. */}
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

      {/* Focus Task Highlighted card for the highest priority available task. */}
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
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.focusTitle} numberOfLines={2}>
                {focusTask.title}
              </Text>
              
              {/* Display user avatar if they have started this task */}
              {focusTask.inProgress && (
                <View style={styles.miniBadge}>
                   <View style={[styles.miniAvatar, { backgroundColor: '#4A90E2' }]}>
                      <Text style={styles.miniAvatarText}>
                        {getInitial(focusTask.inProgressByName)}
                      </Text>
                   </View>
                   <Text style={[styles.miniBadgeText, { color: "#4A90E2" }]}>
                     Started by {getDisplayName(focusTask.inProgressBy, focusTask.inProgressByName)}
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

      {/* Daily Checklist */}
      <FlatList
        data={chores}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20, color: "#999" }}>
            No chores yet. Add one to get started!
          </Text>
        }
        renderItem={({ item }) => {
          // Check if this specific item is locked for the current user
          const locked = isChoreLocked(item);
          
          return (
            <TouchableOpacity
              style={[
                styles.choreItem,
                // Styling for Completed state
                item.completed && {
                  backgroundColor: "#f0fff4",
                  borderColor: "transparent",
                },
                // Styling for In-Progress state
                item.inProgress && {
                  borderColor: "#4A90E2",
                  backgroundColor: "#f8fbff",
                  paddingVertical: 12,
                },
                locked && { opacity: 0.5 }
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

                {/* Badge: In Progress (shows who is working) */}
                {item.inProgress && (
                  <View style={styles.miniBadge}>
                    <View style={[styles.miniAvatar, { backgroundColor: '#4A90E2' }]}>
                        <Text style={styles.miniAvatarText}>
                          {getInitial(item.inProgressByName)}
                        </Text>
                    </View>
                    <Text style={[styles.miniBadgeText, { color: "#4A90E2" }]}>
                      {locked 
                        ? `${item.inProgressByName} is working` 
                        : `${getDisplayName(item.inProgressBy, item.inProgressByName)} is working`
                      }
                    </Text>
                  </View>
                )}

                {/* Badge: Completed (shows who finished it) */}
                {item.completed && (
                  <View style={styles.miniBadge}>
                      <View style={[styles.miniAvatar, { backgroundColor: '#4CAF50' }]}>
                        <Text style={styles.miniAvatarText}>
                          {getInitial(item.completedByName)}
                        </Text>
                      </View>
                      <Text style={[styles.miniBadgeText, { color: "#4CAF50" }]}>
                        Done by {getDisplayName(item.completedBy, item.completedByName)}
                      </Text>
                  </View>
                )}
              </View>

              {/* Action Button (Play/Stop/Checkmark) */}
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
    padding: 18,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  choreInfo: { flexDirection: "column", alignItems: "flex-start", flex: 1 },
  choreText: { fontSize: 16, color: "#333" },
  choreAction: { flexDirection: "row", alignItems: "center" },
  completedText: { textDecorationLine: "line-through", color: "#aaa" },
  pointsText: { fontWeight: "bold", color: "#6200ee", marginRight: 12 },
  miniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6
  },
  miniAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  miniAvatarText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold'
  },
  miniBadgeText: {
    fontSize: 12,
    fontWeight: '600'
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
    padding: 20,
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