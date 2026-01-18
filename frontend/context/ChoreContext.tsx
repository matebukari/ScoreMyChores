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
import { choreService, Chore } from "@/services/choreService";

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
    await choreService.updateChoreStatus(choreId, status);
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