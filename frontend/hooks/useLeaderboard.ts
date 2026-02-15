import { useState, useMemo } from "react";
import { useChores } from "@/context/ChoreContext";
import { useHousehold } from "@/context/HouseholdContext";
import { Timestamp } from "firebase/firestore";

export function useLeaderboard() {
  const { activities } = useChores();
  const { memberProfiles } = useHousehold();
  const [timeFrame, setTimeFrame] = useState<"weekly" | "monthly">("weekly");

  const leaderboardData = useMemo(() => {
    const now = new Date();
    let startOfPeriod = new Date();

    // Set the cutoff date based on selection
    if (timeFrame === "weekly") {
      // Calculate start of current week (Monday)
      const currentDayIndex = (now.getDay() + 6) % 7; 
      startOfPeriod = new Date(now);
      startOfPeriod.setDate(now.getDate() - currentDayIndex);
      startOfPeriod.setHours(0, 0, 0, 0);
    } else {
      // Start of current month
      startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // A map to store scores
    const scores: Record<
      string,
      { name: string; score: number; avatar?: string }
    > = {};

    activities.forEach((activity) => {
      if (!activity.completedAt) return;

      const completedDate = 
        activity.completedAt instanceof Timestamp
          ? activity.completedAt.toDate()
          : new Date(activity.completedAt);
      if (completedDate < startOfPeriod) return;

      const userId = activity.userId;
      const liveProfile = memberProfiles[userId];
      const displayName = 
        liveProfile?.displayName || activity.userName || "Unknown";
      const displayAvatar = liveProfile?.photoURL || activity.userAvatar;

      if (!scores[userId]) {
        scores[userId] = {
          name: displayName,
          score: 0,
          avatar: displayAvatar,
        };
      } else if (liveProfile) {
        scores[userId].name = displayName;
        scores[userId].avatar = displayAvatar;
      }

      scores[userId].score += activity.points;
    });

    return Object.entries(scores)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.score - a.score);
  }, [activities, timeFrame, memberProfiles]);

  return { leaderboardData, timeFrame, setTimeFrame };
}