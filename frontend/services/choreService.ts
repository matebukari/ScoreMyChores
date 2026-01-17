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
  householdId: string;
  createdBy: string;
  assignedTo?: string | null;
};

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
  toggleChore: async (choreId: string, isCompleted: boolean) => {
    const choreRef = doc(db, "chores", choreId);
    await updateDoc(choreRef, {
      completed: !isCompleted,
      completedAt: !isCompleted ? serverTimestamp() : null
    });
  },

  // Delete a chore
  deleteChore: async (choreId: string) => {
    await deleteDoc(doc(db, "chores", choreId));
  }
};