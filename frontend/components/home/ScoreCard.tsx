import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import PagerView from "react-native-pager-view";
import { useAuth } from "@/context/AuthContext";

interface ScoreCardProps {
  weeklyScore: number;
  monthlyScore: number;
  completedDays: number[];
}

export default function ScoreCard({ weeklyScore, monthlyScore, completedDays }: ScoreCardProps) {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const currentDayIndex = (new Date().getDay() + 6) % 7;

  return (
    <View style={styles.scoreCard}>
      <Text style={styles.greeting}>
        Hey, {user?.displayName || user?.email?.split("@")[0]}!
      </Text>

      <PagerView
        style={styles.pagerContainer}
        initialPage={0}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {/* Page 1: Weekly Score */}
        <View key="1" style={styles.page}>
          <Text style={styles.label}>THIS WEEK</Text>
          <Text style={styles.scoreValue}>{weeklyScore}</Text>

          <View style={styles.streakRow}>
            {weekDays.map((day, index) => (
              <View key={index} style={styles.dayContainer}>
                <View
                  style={[
                    styles.dayCircle,
                    completedDays.includes(index) && styles.dayActive,
                    index === currentDayIndex && styles.dayToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      completedDays.includes(index) && styles.dayTextActive,
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Page 2: Monthly Score */}
        <View key="2" style={styles.page}>
          <Text style={styles.label}>THIS MONTH</Text>
          <Text style={styles.scoreValue}>{monthlyScore}</Text>
          
          <View style={styles.monthContainer}>
            <Text style={styles.monthText}>Keep stacking those points!</Text>
          </View>
        </View>
      </PagerView>

      {/* Pagination Dots */}
      <View style={styles.paginationDots}>
        <View style={[styles.dot, currentPage === 0 && styles.dotActive]} />
        <View style={[styles.dot, currentPage === 1 && styles.dotActive]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scoreCard: {
    backgroundColor: "#63B995",
    paddingVertical: 30,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
    overflow: "hidden", 
  },
  greeting: { 
    color: "rgba(255,255,255,0.8)", 
    fontSize: 16, 
    marginBottom: 5 
  },
  pagerContainer: {
    width: "100%",
    height: 160, // Fixed height for swipeable area
  },
  page: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  label: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 5,
  },
  scoreValue: { 
    color: "#fff", 
    fontSize: 48, 
    fontWeight: "bold",
    marginBottom: 10,
  },
  streakRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 5,
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
  
  // Monthly specific
  monthContainer: {
    height: 30, // Match height of streak row to prevent layout shift
    justifyContent: 'center',
    marginTop: 5,
  },
  monthText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontStyle: 'italic',
  },

  // Pagination
  paginationDots: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  dotActive: {
    backgroundColor: "#FFFFFF",
  }
});