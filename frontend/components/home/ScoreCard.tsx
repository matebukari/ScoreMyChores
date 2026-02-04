import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "@/context/AuthContext";

interface ScoreCardProps {
  score: number;
}

export default function ScoreCard({ score }: ScoreCardProps) {
  const { user } = useAuth();

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const currentDayIndex = new Date().getDay() - 1;

  return (
    <View style={styles.scoreCard}>
      <Text style={styles.greeting}>
        Hey, {user?.displayName || user?.email?.split("@")[0]}!
      </Text>
      <Text style={styles.scoreValue}>{score}</Text>

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
  );
}

const styles = StyleSheet.create({
  scoreCard: {
    backgroundColor: "#63B995",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  greeting: { color: "rgba(255,255,255,0.8)", fontSize: 16, marginBottom: 10 },
  scoreValue: { color: "#fff", fontSize: 48, fontWeight: "bold" },
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
  dayTextActive: { color: "#63B995" },
});