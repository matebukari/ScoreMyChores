import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ScoreCard from "@/components/home/ScoreCard";
import FocusTask from "@/components/home/FocusTask";
import ChoreItem from "@/components/home/ChoreItem";

import { useHomeScreen } from "@/hooks/useHomeScreen";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const {
    chores,
    loading,
    weeklyScore,
    monthlyScore,
    completedDays,
    focusTask,
    confettiTrigger,
    handleChorePress,
    isAdmin,
  } = useHomeScreen();

  const insets = useSafeAreaInsets();
  const safeTop =
    insets.top > 0 ? insets.top : Platform.OS === "android" ? 30 : 0;

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#63B995" />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: safeTop,
          paddingLeft: insets.left + 20,
          paddingRight: insets.right + 20,
        },
      ]}
    >
      {/* Score & Streak */}
      <ScoreCard 
        weeklyScore={weeklyScore}
        monthlyScore={monthlyScore} 
        completedDays={completedDays} 
      />

      {/* Priotary Focus Task */}
      {focusTask ? (
        <FocusTask task={focusTask} onPress={handleChorePress} />
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
            {isAdmin
              ? "No chores yet. Add one to get started!"
              : "No chores yet."
            }
            
          </Text>
        }
        renderItem={({ item }) => (
          <ChoreItem item={item} onPress={handleChorePress} />
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
