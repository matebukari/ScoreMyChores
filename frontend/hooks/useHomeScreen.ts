import { useState, useMemo, useCallback } from "react";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";
import { useChores } from "@/context/ChoreContext";

export function useHomeScreen() {
  const { user } = useAuth();
  const { chores, activities, updateStatus, loading } = useChores();
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  // Check if a chore is locked for the current user
  const isChoreLocked = useCallback((chore: any) => {
    if (chore.inProgress && chore.inProgressBy !== user?.uid) return true;
    if (chore.completed && chore.completedBy !== user?.uid) return true;
    return false;
  }, [user]);

  // Handle chore press (toggle status + haptics)
  const handleChorePress = useCallback(async (chore: any) => {
    if (isChoreLocked(chore)) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      if (chore.completed) {
        await updateStatus(chore.id, "pending");
      } else if (chore.inProgress) {
        await updateStatus(chore.id, "completed");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setConfettiTrigger((prev) => prev + 1);
      } else {
        await updateStatus(chore.id, "in-progress");
      }
    } catch (error) {
      console.error("Failed to toggle:", error);
    }
  }, [isChoreLocked, updateStatus]);

  // Calculate current user's score
  const currentScore = useMemo(() => {
    if (!user || !activities) return 0;

    return activities
      .filter((a) => a.userId === user.uid)
      .reduce((sum, activity) => sum + activity.points, 0);
  }, [activities, user]);

  const completedDays = useMemo<number[]>(() => {
    if (!user || !activities) return [] as number[];

    const userActivities = activities.filter((a) => a.userId === user.uid);
    const now = new Date();

    const currentDayIndex = (now.getDay() + 6) % 7;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currentDayIndex);
    startOfWeek.setHours(0, 0, 0, 0);

    const indices = new Set<number>();

    userActivities.forEach((act) => {
      const actDate = act.completedAt?.toDate ? act.completedAt.toDate() : new Date(act.completedAt as any);      const cleanActDate = new Date(actDate);
      cleanActDate.setHours(0, 0, 0, 0);

      const diffTime = cleanActDate.getTime() - startOfWeek.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

      if (diffDays >= 0 && diffDays <= 6) {
        indices.add(diffDays);
      }

    });

    return Array.from(indices);
  }, [activities, user]);

  // Determine the priority "Focus Task"
  const focusTask = useMemo(() => {
    const availableChores = chores.filter((c) => {
      if (c.completed) return false;
      if (c.inProgress && c.inProgressBy !== user?.uid) return false;
      return true;
    });

    return availableChores.sort((a, b) => {
      if (a.inProgress && !b.inProgress) return -1;
      if (!a.inProgress && b.inProgress) return 1;
      return b.points - a.points;
    })[0];
  }, [chores, user]);

  return {
    chores,
    loading,
    currentScore,
    completedDays,
    focusTask,
    confettiTrigger,
    handleChorePress,
  };
}