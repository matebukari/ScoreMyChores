import { db } from "../config/firebase";
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  setDoc, 
  arrayUnion, 
  query,
  where,
  getDocs
} from "firebase/firestore";

// Types for the data
export type Household = {
  id: string;
  name: string;
  inviteCode: string;
  members: { [userId: string]: 'admin' | 'member' };
};

export const householdService = {
  // Get details of a specific household
  getHousehold: async (householdId: string): Promise<Household | null> => {
    const docRef = doc(db, "households", householdId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Household;
    }
    return null;
  },

  // Swich user's active view
  setActiveHouseholdId: async (userId: string, householdId: string) => {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      activeHouseholdId: householdId 
    }, { merge: true });
  },

  // Create new household
  createHousehold: async (userId: string, householdName: string) => {
    const newHouseRef = doc(collection(db, "households"));
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create the House
    await setDoc(newHouseRef, {
      name: householdName, 
      inviteCode,
      members: { [userId]: 'admin' } // Creater is admin
    });

    // Link User to House
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      joinedHouseholds: arrayUnion(newHouseRef.id),
      activeHouseholdId: newHouseRef.id
    }, { merge: true });

    return newHouseRef.id;
  },

  // Join an existing household
  joinHousehold: async (userId: string, inviteCode: string) => {
    // Find the house with this code
    const q = query(collection(db, "households"), where("inviteCode", "==", inviteCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Invalid invite code");
    }

    const houseDoc = querySnapshot.docs[0];
    const houseId = houseDoc.id;

    // Add user to household members as 'member'
    await updateDoc(doc(db, "households", houseId), {
      [`members.${userId}`]: 'member'
    });

    // Link household to user
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      joinedHouseholds: arrayUnion(houseId),
      activeHouseholdId: houseId
    }, { merge: true });

    return houseId;
  },
};