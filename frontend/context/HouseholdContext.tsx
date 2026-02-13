import React, { createContext, useContext, useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  documentId,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuth } from "./AuthContext";
import { householdService, Household } from "@/services/householdService";

// Type for Member Profiles
export type UserProfile = {
  id: string;
  displayName?: string;
  photoURL?: string;
  email?: string;
};

type HouseholdContextType = {
  activeHousehold: Household | null;
  activeHouseholdId: string | null;
  joinedHouseholds: string[];
  switchHousehold: (householdId: string) => Promise<void>;
  loading: boolean;
  memberProfiles: Record<string, UserProfile>;
};

const HouseholdContext = createContext<HouseholdContextType | undefined>(
  undefined,
);

export function HouseholdProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [activeHousehold, setActiveHousehold] = useState<Household | null>(
    null,
  );
  const [activeHouseholdId, setActiveHouseholdId] = useState<string | null>(
    null,
  );
  const [joinedHouseholds, setJoinedHouseholds] = useState<string[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<
    Record<string, UserProfile>
  >({});
  const [loading, setLoading] = useState(true);

  // Listen to the User Document to see what House they are looking at
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const userRef = doc(db, "users", user.uid);

    const unsubscribeUser = onSnapshot(
      userRef,
      async (docSnap) => {
        if (!docSnap.exists()) {
          console.log("User documant missing in Firestore");
          setActiveHouseholdId(null);
          setLoading(false);
          return;
        }

        const data = docSnap.data();
        const newActiveId = data.activeHouseholdId;
        const joined = data.joinedHouseholds || [];

        setJoinedHouseholds(joined);

        // If User is in a house but "activeHouseholdId" is lost set the first joined house as active.
        if (!newActiveId && joined.length > 0) {
          console.log("Fixing orphaned user state...");
          await householdService.setActiveHouseholdId(user.uid, joined[0]);
          return;
        }

        setActiveHouseholdId(newActiveId);

        if (newActiveId) {
          try {
            const householdDetails =
              await householdService.getHousehold(newActiveId);
            setActiveHousehold(householdDetails);
          } catch (error) {
            console.error("Error fetching houshold details:", error);
            setActiveHousehold(null);
          }
        } else {
          setActiveHousehold(null);
        }

        setLoading(false);
      },
      (error) => {
        console.error("Snapshot error:", error);
        setLoading(false);
      },
    );

    return () => unsubscribeUser();
  }, [user]);

  // Listen to the Active Household Document in Real-Time
  useEffect(() => {
    if (!activeHouseholdId) return;

    const householdRef = doc(db, "households", activeHouseholdId);

    const unsubscribeHousehold = onSnapshot(
      householdRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setActiveHousehold({ id: docSnap.id, ...docSnap.data() } as Household);
        } else {
          setActiveHousehold(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Household snaphot error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribeHousehold();
  }, [activeHousehold]);

  // Function to switch houses
  const switchHousehold = async (householdId: string) => {
    if (!user) return;
    setActiveHouseholdId(householdId);
    await householdService.setActiveHouseholdId(user.uid, householdId);
  };

  useEffect(() => {
    if (!user || !activeHousehold) {
      setMemberProfiles({});
      return;
    }

    const memberIds = Object.keys(activeHousehold.members || {});
    if (memberIds.length === 0) return;

    // Firestore 'in' query supports up to 10 items.
    const q = query(
      collection(db, "users"),
      where(documentId(), "in", memberIds),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const profiles: Record<string, UserProfile> = {};
        snapshot.docs.forEach((doc) => {
          const data = doc.data();

          let effectiveAvatar = data.photoURL
          let effectiveName = data.displayName;

          if (
            data.householdSettings &&
            data.householdSettings[activeHousehold.id]
          ) {
            const houseSettings = data.householdSettings[activeHousehold.id];

            if (houseSettings.avatar) {
              effectiveAvatar = houseSettings.avatar;
            }

            if (houseSettings.displayName) {
              effectiveName = houseSettings.displayName;
            }
          }

          profiles[doc.id] = {
            id: doc.id,
            ...data,
            photoURL: effectiveAvatar,
            displayName: effectiveName
          };
        });
        setMemberProfiles(profiles);
      },
      (error) => {
        if (error.code !== "permission-denied") {
          console.error("Member profile fetch error:", error);
        }
      },
    );

    return () => unsubscribe();
  }, [activeHousehold, user]);

  return (
    <HouseholdContext.Provider
      value={{
        activeHousehold,
        activeHouseholdId,
        joinedHouseholds,
        switchHousehold,
        memberProfiles,
        loading,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
}

export const useHousehold = () => {
  const context = useContext(HouseholdContext);
  if (!context)
    throw new Error("useHousehold must be used within a HouseholdProvider");
  return context;
};
