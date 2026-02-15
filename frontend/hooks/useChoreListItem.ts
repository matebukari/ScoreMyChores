import { useState, useEffect, useMemo, useCallback } from "react";

export function useChoreListItem(item: any, memberProfiles: Record<string, any>) {
  const [_, setTick] = useState(0);

  // 1. Get a stable timestamp (primitive number)
  const scheduledTime = useMemo(() => {
    if (!item.scheduledFor) return null;
    const date = item.scheduledFor.toDate 
      ? item.scheduledFor.toDate() 
      : new Date(item.scheduledFor);
    return date.getTime();
  }, [item.scheduledFor]);

  // 2. Calculate futureDate
  const futureDate = useMemo(() => {
    if (!scheduledTime) return null;
    if (scheduledTime > Date.now()) {
      return new Date(scheduledTime);
    }
    return null;
  }, [scheduledTime, _]);

  // 3. Timer Effect
  useEffect(() => {
    if (!scheduledTime) return;
    if (Date.now() >= scheduledTime) return;

    const interval = setInterval(() => {
      if (Date.now() >= scheduledTime) {
        setTick(t => t + 1);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [scheduledTime]);

  // 4. Helper: Resolve Profile
  const getLiveProfile = useCallback((userId: string, snapshotName: string, snapshotAvatar: string) => {
    const liveUser = memberProfiles[userId];
    return {
      name: liveUser?.displayName || snapshotName || "Unknown",
      avatar: liveUser?.photoURL || snapshotAvatar || null,
    };
  }, [memberProfiles]);

  // 5. Helper: Format Date Text (Moved here)
  const getScheduledText = useCallback((date: Date) => {
    const now = new Date();
    const isToday = date.getDate() === now.getDate() &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear();
    
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) return `Today, ${timeStr}`;
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.getDate() === tomorrow.getDate() &&
                       date.getMonth() === tomorrow.getMonth() &&
                       date.getFullYear() === tomorrow.getFullYear();

    if (isTomorrow) return `Tomorrow, ${timeStr}`;

    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
  }, []);

  return {
    futureDate,
    getLiveProfile,
    getScheduledText
  };
}