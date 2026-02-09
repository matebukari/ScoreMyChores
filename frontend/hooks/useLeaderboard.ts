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
    const cutoffDate = new Date();

    // Set the cutoff date based on selection
    if (timeFrame === "weekly") {
      cutoffDate.setDate(now.getDate() - 7);
    } else {
      cutoffDate.setDate(now.getDate() - 30);
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
      if (completedDate < cutoffDate) return;

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