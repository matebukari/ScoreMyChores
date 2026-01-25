import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  query,
  where,
  getDocs
} from "firebase/firestore";

export type Chore = {
  id: string;
  title: string;
  description?: string;
  points: number;
  completed: boolean;
  completedAt?: any;
  inProgress?: boolean;
  householdId: string;
  createdBy: string;
  inProgressBy?: string | null;
  completedBy?: string | null;
  inProgressByName?: string | null;
  completedByName?: string | null;
  inProgressByAvatar?: string | null;
  completedByAvatar?: string | null;


};

// Helper for passing user details
export type UserSnapshot = {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
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

  // Resets a single Chore (preserves History)
  resetChore: async (choreId: string) => {
    const choreRef = doc(db, "chores", choreId);
    await updateDoc(choreRef, {
      completed: false,
      inProgress: false,
      completedAt: null,
      inProgressBy: null,
      inProgressByName: null,
      inProgressByAvatar: null,
      completedBy: null,
      completedByName: null,
      completedByAvatar: null,
    });
  },

  //Reset all Chores (Preserves history)
  resetAllChores: async (householdId: string) => {
    const q = query(collection(db, "chores"), where("householdId", "==", householdId));
    const snapshot = await getDocs(q);

    const batch = writeBatch(db);

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        completed: false,
        inProgress: false,
        completedAt: null,
        inProgressBy: null,
        inProgressByName: null,
        inProgressByAvatar: null,
        completedBy: null,
        completedByName: null,
        completedByAvatar: null,
      });
    });

    await batch.commit();
  },
  

  // Toggle chore completion
  updateChoreStatus: async (
    choreId: string, status: 'pending' | 'in-progress' | 'completed',
    user: UserSnapshot,
    choreDetails?: { householdId: string; title: string; points: number }
  ) => {
    const choreRef = doc(db, "chores", choreId);
    
    // 1. Prepare Chore Updates
    const updates = {
      completed: status === 'completed',
      inProgress: status === 'in-progress',
      completedAt: status === 'completed' ? serverTimestamp() : null,

      inProgressBy: status === 'in-progress' ? user.uid : null,
      inProgressByName: status === 'in-progress' ? user.displayName : null,
      inProgressByAvatar: status === 'in-progress' ? user.photoURL : null,

      completedBy: status === 'completed' ? user.uid : null,
      completedByName: status === 'completed' ? user.displayName : null,
      completedByAvatar: status === 'completed' ? user.photoURL : null,
    }

    const batch = writeBatch(db);
    batch.update(choreRef, updates);

    // 2. Handle History (Activities)
    if (status === 'completed' && choreDetails) {
      const historyRef = doc(collection(db, "activities"));
      batch.set(historyRef, {
        choreId: choreId,
        householdId: choreDetails.householdId,
        userId: user.uid,
        userName: user.displayName,
        userAvatar: user.photoURL,
        choreTitle: choreDetails.title,
        points: choreDetails.points,
        completedAt: serverTimestamp(),
        type: 'chore_completion'
      });
      // If undoing (moving away from completed): Remove from history
    } else {
      // Find any existing history for this specific chore and delete it
      const q = query(collection(db, "activities"), where("choreId", "==", choreId));
      const historySnapshot = await getDocs(q);
      historySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
    }

    await batch.commit();
  },

  // Delete a chore
  deleteChore: async (choreId: string) => {
    await deleteDoc(doc(db, "chores", choreId));
  }
};