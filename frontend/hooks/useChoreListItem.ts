import { useState, useEffect, useMemo, useCallback } from "react";

export function useChoreListItem(item: any, memberProfiles: Record<string, any>) {
  const [_, setTick] = useState(0);

  // 1. Get a stable timestamp
  const scheduledTime = useMemo(() => {
    if (!item.scheduledFor) return null;
    // Handle Firestore Timestamp or standard Date
    const date = item.scheduledFor.toDate 
      ? item.scheduledFor.toDate() 
      : new Date(item.scheduledFor);
    return date.getTime();
  }, [item.scheduledFor]);

  // 2. Calculate futureDate synchronously so it's always fresh
  const futureDate = useMemo(() => {
    if (!scheduledTime) return null;
    if (scheduledTime > Date.now()) {
      return new Date(scheduledTime);
    }
    return null;
  }, [scheduledTime, _]); // Re-calculate when 'tick' updates

  // 3. Timer Effect
  useEffect(() => {
    if (!scheduledTime) return;

    // If time has already passed, do nothing
    if (Date.now() >= scheduledTime) return;

    // Check every second
    const interval = setInterval(() => {
      // If we crossed the threshold
      if (Date.now() >= scheduledTime) {
        setTick(t => t + 1); // Force a re-render
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [scheduledTime]);

  // Helper to resolve profile data
  const getLiveProfile = useCallback((userId: string, snapshotName: string, snapshotAvatar: string) => {
    const liveUser = memberProfiles[userId];
    return {
      name: liveUser?.displayName || snapshotName || "Unknown",
      avatar: liveUser?.photoURL || snapshotAvatar || null,
    };
  }, [memberProfiles]);

  return {
    futureDate,
    getLiveProfile
  };
}