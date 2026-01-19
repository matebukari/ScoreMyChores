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

export default function HomeScreen() {
  const { user } = useAuth();
  const { chores, updateStatus, loading } = useChores();

  const handleChorePress = async (chore: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      if (chore.completed) {
        await updateStatus(chore.id, "pending");
      } else if (chore.inProgress) {
        await updateStatus(chore.id, "completed");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await updateStatus(chore.id, "in-progress");
      }
    } catch (error) {
      console.error("Failed to toggle:", error);
    }
  };

  const currentScore = chores
    .filter((c) => c.completed && c.completedBy === user?.uid)
    .reduce((sum, chore) => sum + chore.points, 0);

  const incompleteChores = chores.filter((c) => !c.completed);
  const focusTask = incompleteChores.sort((a, b) => {
    if (a.inProgress && !b.inProgress) return -1;
    if (!a.inProgress && b.inProgress) return 1;
    return b.points - a.points;
  })[0];

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const currentDayIndex = new Date().getDay() - 1;

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header / Score Section */}
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

      {/* Focus Task Section */}
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
              focusTask.inProgress && {
                borderColor: "#4A90E2",
              },
            ]}
            onPress={() => handleChorePress(focusTask)}
          >
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.focusTitle} numberOfLines={2}>
                {focusTask.title}
              </Text>
              {focusTask.inProgress && (
                <Text
                  style={{
                    color: "#4A90E2",
                    fontWeight: "bold",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  IN PROGRESS...
                </Text>
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

      <FlatList
        data={chores}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20, color: "#999" }}>
            No chores yet. Add one to get started!
          </Text>
        }
        renderItem={({ item }) => (
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
                paddingVertical: 12,
              },
            ]}
            onPress={() => handleChorePress(item)}
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
              {item.inProgress && (
                <Text style={{ fontSize: 10, color: "#4A90E2", marginTop: 2 }}>
                  IN PROGRESS
                </Text>
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
        )}
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

  // Streak Styles
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

  // Focus Task Styles
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
