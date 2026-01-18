import React, { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from '@/config/firebase';
import { useHousehold } from "./HouseholdContext";
import { useAuth } from "./AuthContext";
import { choreService, Chore, UserSnapshot } from "@/services/choreService";

type ChoreContextType = {
  chores: Chore[];
  loading: boolean;
  addChore: (title: string, points: number) => Promise<void>;
  updateStatus: (choreId: string, status: 'pending' | 'in-progress' | 'completed') => Promise<void>;
};

const ChoreContext = createContext<ChoreContextType | undefined>(undefined);

export function ChoreProvider({ children }: { children: React.ReactNode }) {
  const { activeHouseholdId } = useHousehold();
  const { user } = useAuth();
  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeHouseholdId) {
      setChores([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Query chores that belong to the active household
    const q = query(
      collection(db, "chores"),
      where("householdId", "==", activeHouseholdId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const choreList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Chore[];

      setChores(choreList);
      setLoading(false);
    });

    return () => unsubscribe()
  }, [activeHouseholdId]);

  const addChore = async (title: string, points: number) => {
    if (!activeHouseholdId || !user) {
      throw new Error("You must be logged in and in a household to add chores.");
    }

    try {
      await choreService.addChore(activeHouseholdId, user.uid, {
        title,
        points
      });
    } catch (error) {
      console.error("Failed to add chore:", error);
      throw error;
    }
  };

  const updateStatus = async (choreId: string, status: 'pending' | 'in-progress' | 'completed') => {
    if (!user) return;

    // Create a Snapshot of the user's name
    const cleanName = user.displayName || user.email?.split('@')[0] || 'Member';

    const userSnapshot: UserSnapshot = {
      uid: user.uid,
      displayName: cleanName
    };

    // LOGIC: If we are trying to start a task...
    if (status === 'in-progress') {
      // Find the chore that is currently running (if any)
      const currentActiveChore = chores.find(c => c.inProgress);
      // If we found one, and it's NOT the one we just clicked...
      if (currentActiveChore && currentActiveChore.id !== choreId) {
        // ...turn it off (set to pending)
        await choreService.updateChoreStatus(currentActiveChore.id, 'pending', userSnapshot);
      }
    }

    // Proceed with updating the specific chore we clicked
    await choreService.updateChoreStatus(choreId, status, userSnapshot);
  }

  return (
    <ChoreContext.Provider value={{ chores, loading, addChore, updateStatus }}>
      {children}
    </ChoreContext.Provider>
  );
}

export const useChores = () => {
  const context = useContext(ChoreContext);
  if (!context) throw new Error('useChores must be used within a ChoreProvider');
  return context
}