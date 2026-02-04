import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform
} from "react-native";
import * as Haptics from "expo-haptics";
import ConfettiCannon from "react-native-confetti-cannon"
import { useAuth } from "@/context/AuthContext";
import { useChores } from "@/context/ChoreContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScoreCard from "@/components/home/ScoreCard";
import FocusTask from "@/components/home/FocusTask";
import ChoreItem from "@/components/home/ChoreItem";

const { width } = Dimensions.get("window");

/**
 * HomeScreen Component
 * The main dashboard that displays user score, the priority "Focus Task",
 * and the full list of daily chores.
 */
export default function HomeScreen() {
  const { user } = useAuth();
  const { chores, updateStatus, loading } = useChores();

  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const insets = useSafeAreaInsets();
  const safeTop = insets.top > 0 ? insets.top : (Platform.OS === 'android' ? 30 : 0);

  // Logic to determine if action is allowed
  const isChoreLocked = (chore: any) => {
    if (chore.inProgress && chore.inProgressBy !== user?.uid) return true;
    if (chore.completed && chore.completedBy !== user?.uid) return true;
    return false;
  };

  const handleChorePress = async (chore: any) => {
    if (isChoreLocked(chore)) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      if (chore.completed) {
        await updateStatus(chore.id, "pending");
      } else if (chore.inProgress) {
        await updateStatus(chore.id, "completed");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setConfettiTrigger(prev => prev + 1);
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

  const availableChores = chores.filter((c) => {
    if (c.completed) return false;
    if (c.inProgress && c.inProgressBy !== user?.uid) return false;
    return true;
  });

  const focusTask = availableChores.sort((a, b) => {
    if (a.inProgress && !b.inProgress) return -1;
    if (!a.inProgress && b.inProgress) return 1;
    return b.points - a.points;
  })[0];

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#63B995" />
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      { paddingTop: safeTop, paddingLeft: insets.left + 20, paddingRight: insets.right + 20 }
    ]}>

      {/* Score & Streak */}
      <ScoreCard score={currentScore} />

      {/* Priotary Focus Task */}
      {focusTask ? (
        <FocusTask
          task={focusTask}
          onPress={handleChorePress}
        />
      ) : (
        <View style={styles.focusContainer}>
          <Text>ALL CAUGHT UP!</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Daily Checklist</Text>

      {/* Daily Checklist */}
      <FlatList
        data={chores}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20, color: "#999" }}>
            No chores yet. Add one to get started!
          </Text>
        }
        renderItem={({ item }) => (
          <ChoreItem
            item={item}
            onPress={handleChorePress}
          />
        )}
      />

      {confettiTrigger > 0 && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <ConfettiCannon
            key={confettiTrigger}
            count={200}
            origin={{ x: width / 2, y: 0 }}
            autoStart={true}
            fadeOut={true}
            fallSpeed={3000}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  focusContainer: { marginBottom: 25 },
  focusLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#63B995",
    letterSpacing: 1,
  },
});