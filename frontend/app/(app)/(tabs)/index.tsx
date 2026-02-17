import React from "react";
import {
  View,
  Text,
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
      <View className="flex-1 justify-center bg-background dark:bg-background-dark">
        <ActivityIndicator size="large" color="#63B995" />
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-background dark:bg-background-dark"
      style={{
        paddingTop: safeTop,
        paddingLeft: insets.left + 20,
        paddingRight: insets.right + 20,
      }}
    >
      {/* ScoreCard */}
      <View className="mb-4">
        <ScoreCard 
          weeklyScore={weeklyScore}
          monthlyScore={monthlyScore} 
          completedDays={completedDays} 
        />
      </View>

      <FlatList
        data={chores}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Priority Focus Task */}
            {focusTask ? (
              <FocusTask task={focusTask} onPress={handleChorePress} />
            ) : (
              <View className="mb-[25px]">
                <Text className="text-text-main dark:text-text-inverted">
                  ALL CAUGHT UP!
                </Text>
              </View>
            )}

            {/* Section Title */}
            <Text className="text-xl font-bold mb-[15px] text-text-main dark:text-text-inverted">
              Daily Checklist
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Text className="text-center mt-5 text-text-muted dark:text-gray-400">
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
        <View className="absolute inset-0" pointerEvents="none">
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