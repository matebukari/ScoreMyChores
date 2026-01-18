import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy
} from "firebase/firestore";
import { householdService } from "./householdService";

export type Chore = {
  id: string;
  title: string;
  description?: string;
  points: number;
  completed: boolean;
  inProgress?: boolean;
  householdId: string;
  createdBy: string;
  inProgressBy?: string | null;
  completedBy?: string | null;
  inProgressByName?: string | null;
  completedByName?: string | null;
};

// Helper for passing user details
export type UserSnapshot = {
  uid: string;
  displayName: string | null;
}

export const choreService = {
  // Add a new chore
  addChore: async (householdId: string, userId: string, choreData: Partial<Chore>) => {
    return await addDoc(collection(db, "chores"), {
      ...choreData,
      householdId,
      createdBy: userId,
      completed: false,
      createdAt: serverTimestamp(),
    });
  },

  // Toggle chore completion
  updateChoreStatus: async (choreId: string, status: 'pending' | 'in-progress' | 'completed', user: UserSnapshot) => {
    const choreRef = doc(db, "chores", choreId);
    
    const updates = {
      completed: status === 'completed',
      inProgress: status === 'in-progress',
      completedAt: status === 'completed' ? serverTimestamp() : null,

      inProgressBy: status === 'in-progress' ? user.uid : null,
      inProgressByName: status === 'in-progress' ? user.displayName : null,

      completedBy: status === 'completed' ? user.uid : null,
      completedByName: status === 'completed' ? user.displayName : null,
    }

    await updateDoc(choreRef, updates);
  },

  // Delete a chore
  deleteChore: async (choreId: string) => {
    await deleteDoc(doc(db, "chores", choreId));
  }
};