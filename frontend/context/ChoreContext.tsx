import React, { createContext, useContext, useEffect, useState } from "react";
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
  addChore: (title: string, points: number, scheduledFor?: Date | null) => Promise<void>;
  updateStatus: (choreId: string, status: 'pending' | 'in-progress' | 'completed') => Promise<void>;
  resetChore: (choreId: string) => Promise<void>;
  resetAll: () => Promise<void>;
};

const ChoreContext = createContext<ChoreContextType | undefined>(undefined);

export function ChoreProvider({ children }: { children: React.ReactNode }) {
  const { activeHouseholdId } = useHousehold();
  const { user } = useAuth();
  
  // 'allChores' stores everything from the database (including future tasks)
  const [allChores, setAllChores] = useState<Chore[]>([]);
  // 'displayedChores' stores only what should be visible now
  const [displayedChores, setDisplayedChores] = useState<Chore[]>([]);
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data Listener
  useEffect(() => {
    if (!user || !activeHouseholdId) {
      setAllChores([]);
      setDisplayedChores([]);
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

    // Fetch raw list into 'allChores'
    const unsubChores = onSnapshot(qChores, (snapshot) => {
      const rawList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Chore[];
      setAllChores(rawList);
    }, (error) => {
      if (error.code !== 'permission-denied') console.error("Chores fetch error:", error);
    });

    const unsubActivities = onSnapshot(qActivities, (snapshot) => {
      setActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Activity[]);
      setLoading(false);
    }, (error) => {
      if (error.code !== 'permission-denied') console.error("Activities fetch error:", error);
    });

    return () => {
      unsubChores();
      unsubActivities();
    }
  }, [activeHouseholdId, user]);

  // 2. Time-based Filter (Runs on data change AND every 10 seconds)
  useEffect(() => {
    const updateVisibleChores = () => {
      const now = new Date();
      
      const visible = allChores.filter(chore => {
        // If there is no schedule, show it immediately
        if (!chore.scheduledFor) return true;

        // Handle Firestore Timestamp vs Date object
        const scheduledDate = chore.scheduledFor.toDate 
          ? chore.scheduledFor.toDate() 
          : new Date(chore.scheduledFor);

        // Only show if the time has passed (schedule <= now)
        return scheduledDate <= now;
      });

      setDisplayedChores(visible);
    };

    // Run immediately when 'allChores' changes
    updateVisibleChores();

    // Run periodically to reveal tasks that just became due
    const interval = setInterval(updateVisibleChores, 10000); // Check every 10s

    return () => clearInterval(interval);
  }, [allChores]);

  const addChore = async (title: string, points: number, scheduledFor?: Date | null) => {
    if (!activeHouseholdId || !user) throw new Error("No user/household");
    
    // Create the data object with optional schedule
    const choreData: Partial<Chore> = { title, points };
    if (scheduledFor) {
      choreData.scheduledFor = scheduledFor;
    }

    // Pass the complete object to the service
    await choreService.addChore(activeHouseholdId, user.uid, choreData);
  };

  const updateStatus = async (choreId: string, status: 'pending' | 'in-progress' | 'completed') => {
    if (!user || !activeHouseholdId) return;

    // Create a Snapshot of the user's name
    const cleanName = user.displayName || user.email?.split('@')[0] || 'Member';
    const userSnapshot: UserSnapshot = { uid: user.uid, displayName: cleanName, photoURL: user.photoURL || null };

    // Find the chore object to get its details (look in displayedChores)
    const targetChore = displayedChores.find(c => c.id === choreId);
    if (!targetChore) return;

    // Handle "Only one in-progress at a time" logic
    if (status === 'in-progress') {
      // Find the chore that is currently running (if any)
      const myActiveChore = displayedChores.find(c => c.inProgress && c.inProgressBy === user.uid);
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
      chores: displayedChores, // Map internal 'displayedChores' to public 'chores'
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