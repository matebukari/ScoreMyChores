import React, { act, createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  Timestamp
} from "firebase/firestore";
import { db } from '@/config/firebase';
import { useHousehold } from "./HouseholdContext";
import { useAuth } from "./AuthContext";
import { choreService, Chore, UserSnapshot } from "@/services/choreService";
import { householdService } from "@/services/householdService";

export type Activity = {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  points: number;
  completedAt: Timestamp;
  householdId: string;
};

type ChoreContextType = {
  chores: Chore[];
  activities: Activity[];
  loading: boolean;
  addChore: (title: string, points: number) => Promise<void>;
  updateStatus: (choreId: string, status: 'pending' | 'in-progress' | 'completed') => Promise<void>;
  resetChore: (choreId: string) => Promise<void>;
  resetAll: () => Promise<void>;
};

const ChoreContext = createContext<ChoreContextType | undefined>(undefined);

export function ChoreProvider({ children }: { children: React.ReactNode }) {
  const { activeHousehold, activeHouseholdId } = useHousehold();
  const { user } = useAuth();
  const [chores, setChores] = useState<Chore[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Daily reset check logic
  useEffect(() => {
    const checkDailyReset = async () => {
      if (!activeHousehold || !activeHouseholdId) return;

      const now = new Date();
      // If lastResetDate doesn't exist, assume it's today or yesterday
      const lastReset = activeHousehold.lastResetDate
        ? activeHousehold.lastResetDate.toDate()
        : new Date(0);

      // Check if "Last Reset" was on a different day than "Today"
      const isSameDay =
        now.getFullYear() === lastReset.getFullYear() &&
        now.getMonth() === lastReset.getMonth() &&
        now.getDate() === lastReset.getDate();

      if (!isSameDay) {
        console.log("New day detected! Resetting chores...");
        try {
          // Reset all chores
          await choreService.resetAllChores(activeHouseholdId);
          // Update the last reset date to NOW so it doesn't run again today
          await householdService.updateLastReset(activeHouseholdId);
        } catch (error) {
          console.error("Failed to run daily reset:", error);
        }
      }
    };

    if (activeHouseholdId) {
      checkDailyReset();
    }
  }, [activeHouseholdId, activeHousehold])

  useEffect(() => {
    if (!user || !activeHouseholdId) {
      setChores([]);
      setActivities([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Query chores that belong to the active household
    const qChores = query(
      collection(db, "chores"),
      where("householdId", "==", activeHouseholdId),
      orderBy("createdAt", "desc")
    );

    // Query Activities (For Leaderboard & Score)
    const qActivities = query(
      collection(db, "activities"),
      where("householdId", "==", activeHouseholdId),
      orderBy("completedAt", "desc")
    );

    const unsubChores = onSnapshot(qChores, (snapshot) => {
      setChores(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Chore[]);
    });

    const unsubActivities = onSnapshot(qActivities, (snapshot) => {
      setActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Activity[]);
      setLoading(false);
    })

    return () => {
      unsubChores();
      unsubActivities();
    }
  }, [activeHouseholdId, user]);

  const addChore = async (title: string, points: number) => {
    if (!activeHouseholdId || !user) throw new Error("No user/household");
    await choreService.addChore(activeHouseholdId, user.uid, { title, points });
  };

  const updateStatus = async (choreId: string, status: 'pending' | 'in-progress' | 'completed') => {
    if (!user || !activeHouseholdId) return;

    // Create a Snapshot of the user's name
    const cleanName = user.displayName || user.email?.split('@')[0] || 'Member';
    const userSnapshot: UserSnapshot = { uid: user.uid, displayName: cleanName, photoURL: user.photoURL || null };

    // Find the chore object to get its details
    const targetChore = chores.find(c => c.id === choreId);
    if (!targetChore) return;

    // Handle "Only one in-progress at a time" logic
    // LOGIC: If we are trying to start a task...
    if (status === 'in-progress') {
      // Find the chore that is currently running (if any)
      const myActiveChore = chores.find(c => c.inProgress && c.inProgressBy === user.uid);
      // If we found one, and it's NOT the one we just clicked...
      if (myActiveChore && myActiveChore.id !== choreId) {
        // ...turn it off (set to pending)
        await choreService.updateChoreStatus(myActiveChore.id, 'pending', userSnapshot);
      }
    }

    // Update the target chore AND pass details for history creation
    await choreService.updateChoreStatus(choreId, status, userSnapshot, {
      householdId: activeHouseholdId,
      title: targetChore.title,
      points: targetChore.points
    });
  }

  const resetChore = async (choreId: string) => {
    await choreService.resetChore(choreId);
  };

  const resetAll = async () => {
    if (!activeHouseholdId) return;
    await choreService.resetAllChores(activeHouseholdId);
  }

  return (
    <ChoreContext.Provider value={{
      chores,
      activities, 
      loading, 
      addChore, 
      updateStatus,
      resetChore,
      resetAll, 
    }}>
      {children}
    </ChoreContext.Provider>
  );
}

export const useChores = () => {
  const context = useContext(ChoreContext);
  if (!context) throw new Error('useChores must be used within a ChoreProvider');
  return context
}