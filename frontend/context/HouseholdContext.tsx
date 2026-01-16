import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from './AuthContext';
import { householdService, Household } from '@/services/householdService';

type HouseholdContextType = {
  activeHousehold: Household | null;
  activeHouseholdId: string | null;
  joinedHouseholds: string[]; // List of IDs
  switchHousehold: (householdId: string) => Promise<void>;
  loading: boolean;
};

const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

export function HouseholdProvider ({ children }: { children: React.ReactNode }) {
  const { user } = useAuth(); // Get logged in user
  const [activeHousehold, setActiveHousehold] = useState<Household | null>(null);
  const [activeHouseholdId, setActiveHouseholdId] = useState<string | null>(null);
  const [joinedHouseholds, setJoinedHouseholds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen to the User Document to see what House they are looking at
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const userRef = doc(db, "users", user.uid);

    const unsubscribeUser = onSnapshot(userRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newActiveId = data.activeHouseholdId;
        const joined = data.joinedHouseholds || [];

        setJoinedHouseholds(joined);

        // Only fetch full household details if the ID changed
        if (newActiveId && newActiveId !== activeHouseholdId) {
          setActiveHouseholdId(newActiveId);
          const householdDetails = await householdService.getHousehold(newActiveId);
          setActiveHousehold(householdDetails);
        } else if (!newActiveId) {
          setActiveHousehold(null);
          setActiveHouseholdId(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribeUser();
  }, [user]);

  // Function to switch houses
  const switchHousehold = async (householdId: string) => {
    if (!user) return;
    setActiveHouseholdId(householdId);
    await householdService.setActiveHouseholdId(user.uid, householdId);
  };

  return(
    <HouseholdContext.Provider value={{
      activeHousehold,
      activeHouseholdId,
      joinedHouseholds,
      switchHousehold,
      loading
    }}>
      {children}
    </HouseholdContext.Provider>
  );  
}

export const useHousehold = () => {
  const context = useContext(HouseholdContext);
  if (!context) throw new Error('useHousehold must be used within a HouseholdProvider');
  return context;
};