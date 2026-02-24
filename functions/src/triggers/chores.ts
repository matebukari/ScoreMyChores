import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import { Expo } from "expo-server-sdk";
import { db, expo } from "../config/firebase"

export const notifyOnNewChore = onDocumentCreated("chores/{choreId}", async (event) => {
  const snap = event.data;
  
  // If there's no data, exit early
  if (!snap) return null;

  const newChore = snap.data();
  const householdId = newChore.householdId;
  const creatorId = newChore.createdBy;
  const choreTitle = newChore.title;

  if (!householdId || !creatorId) return null;

  try {
    // 1. Get Household details
    const houseDoc = await db.collection("households").doc(householdId).get();
    if (!houseDoc.exists) return null;
    
    const houseData = houseDoc.data();
    const members = houseData?.members || {};
    const householdName = houseData?.name || "your household";

    // 2. Find everyone EXCEPT the person who added the chore
    const memberIds = Object.keys(members).filter((id) => id !== creatorId);
    if (memberIds.length === 0) return null;

    // 3. Get their Expo Push Tokens from their user profiles
    const tokens: string[] = [];
    const usersSnap = await db
      .collection("users")
      .where(admin.firestore.FieldPath.documentId(), "in", memberIds)
      .get();

    usersSnap.forEach((doc) => {
      const userData = doc.data();
      if (userData.expoPushToken && Expo.isExpoPushToken(userData.expoPushToken)) {
        tokens.push(userData.expoPushToken);
      }
    });

    if (tokens.length === 0) return null;

    // 4. Create the notification messages
    const messages = tokens.map(token => ({
      to: token,
      sound: "default" as const,
      title: `New Chore in ${householdName}! 🧹`,
      body: `A new chore "${choreTitle}" was just added.`,
      data: { route: "/chores" },
    }));

    // 5. Send them via Expo
    const chunks = expo.chunkPushNotifications(messages as any);
    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }

    return null;
  } catch (error) {
    console.error("Error sending notifications:", error);
    return null;
  }
});

export const notifyOnLeaderboardOvertake = onDocumentCreated("activities/{activityId}", async (event) => {
  const snap = event.data;
  if (!snap) return null;

  const newActivity = snap.data();
  const householdId = newActivity.householdId;
  const newActivityUserId = newActivity.userId;
  
  // Only process if it's a chore completion that adds points
  if (newActivity.type !== 'chore_completion' || !newActivity.points) return null;

  try {
    // 1. Fetch all activities for this household to calculate scores
    const activitiesSnap = await db.collection("activities")
      .where("householdId", "==", householdId)
      .get();

    // 2. Calculate old and new scores for each user
    const oldScores: Record<string, number> = {};
    const newScores: Record<string, number> = {};

    activitiesSnap.forEach((doc) => {
      const activity = doc.data();
      const userId = activity.userId;
      const points = activity.points || 0;

      // New scores include all fetched activities
      newScores[userId] = (newScores[userId] || 0) + points;

      // Old scores exclude the activity that was just created
      if (doc.id !== event.params.activityId) {
        oldScores[userId] = (oldScores[userId] || 0) + points;
      }
    });

    // 3. Determine Old 1st Place (handles ties)
    let maxOldScore = 0;
    for (const score of Object.values(oldScores)) {
      if (score > maxOldScore) maxOldScore = score;
    }
    const oldFirstPlaceUserIds = maxOldScore > 0 
      ? Object.keys(oldScores).filter(id => oldScores[id] === maxOldScore) 
      : [];

    // 4. Determine New 1st Place
    let maxNewScore = 0;
    for (const score of Object.values(newScores)) {
      if (score > maxNewScore) maxNewScore = score;
    }
    const newFirstPlaceUserIds = maxNewScore > 0 
      ? Object.keys(newScores).filter(id => newScores[id] === maxNewScore) 
      : [];

    // 5. Find users who were in 1st place before, but are NOT in 1st place anymore
    const overtakenUserIds = oldFirstPlaceUserIds.filter(id => !newFirstPlaceUserIds.includes(id));

    // If nobody was overtaken, exit early
    if (overtakenUserIds.length === 0) return null;

    // 6. Get household name and the overtaker's name for the notification
    const houseDoc = await db.collection("households").doc(householdId).get();
    const householdName = houseDoc.data()?.name || "your household";
    
    let overtakerName = "Someone";
    const overtakerDoc = await db.collection("users").doc(newActivityUserId).get();
    if (overtakerDoc.exists) {
        const data = overtakerDoc.data();
        overtakerName = data?.householdSettings?.[householdId]?.displayName || data?.displayName || "Someone";
    }

    // 7. Get push tokens for the overtaken users and notify them
    const usersToNotifySnap = await db.collection("users")
      .where(admin.firestore.FieldPath.documentId(), "in", overtakenUserIds)
      .get();

    const messages: any[] = [];
    usersToNotifySnap.forEach((doc) => {
      const userData = doc.data();
      if (userData.expoPushToken && Expo.isExpoPushToken(userData.expoPushToken)) {
        messages.push({
          to: userData.expoPushToken,
          sound: "default",
          title: `You've been overtaken! 📉`,
          body: `${overtakerName} just took 1st place in ${householdName}. Go complete a chore to reclaim your spot!`,
          data: { route: "/leaderboard" },
        });
      }
    });

    if (messages.length === 0) return null;

    // 8. Send the notifications
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }

    return null;
  } catch (error) {
    console.error("Error sending overtake notifications:", error);
    return null;
  }
});

export const notifyOnChoreInProgress = onDocumentUpdated("chores/{choreId}", async (event) => {
  const snap = event.data;
  if (!snap) return null;

  const beforeChore = snap.before.data();
  const afterChore = snap.after.data();

  // Check if it was NOT in-progress before, but IS in-progress now
  if (!beforeChore.inProgress && afterChore.inProgress) {
    const householdId = afterChore.householdId;
    const claimingUserId = afterChore.inProgressBy;
    const choreTitle = afterChore.title;

    if (!householdId || !claimingUserId) return null;

    try {
      // Fetch the user's latest accurate name
      let claimerName = "Someone";
      const claimerDoc = await db.collection("users").doc(claimingUserId).get();
      if (claimerDoc.exists) {
          const data = claimerDoc.data();
          claimerName = data?.householdSettings?.[householdId]?.displayName || data?.displayName || "Someone";
      }

      // 1. Get Household details
      const houseDoc = await db.collection("households").doc(householdId).get();
      if (!houseDoc.exists) return null;
      
      const houseData = houseDoc.data();
      const members = houseData?.members || {};
      const householdName = houseData?.name || "your household";

      // 2. Find everyone EXCEPT the person who claimed the chore
      const memberIds = Object.keys(members).filter((id) => id !== claimingUserId);
      if (memberIds.length === 0) return null;

      // 3. Get their Expo Push Tokens from their user profiles
      const tokens: string[] = [];
      const usersSnap = await db
        .collection("users")
        .where(admin.firestore.FieldPath.documentId(), "in", memberIds)
        .get();

      usersSnap.forEach((doc) => {
        const userData = doc.data();
        if (userData.expoPushToken && Expo.isExpoPushToken(userData.expoPushToken)) {
          tokens.push(userData.expoPushToken);
        }
      });

      if (tokens.length === 0) return null;

      // 4. Create the notification messages
      const messages = tokens.map(token => ({
        to: token,
        sound: "default" as const,
        title: `Chore Claimed! ⏳`,
        body: `${claimerName} just started working on "${choreTitle}" in ${householdName}.`,
        data: { route: "/chores" }, 
      }));

      // 5. Send them via Expo
      const chunks = expo.chunkPushNotifications(messages as any);
      for (const chunk of chunks) {
        await expo.sendPushNotificationsAsync(chunk);
      }

      return null;
    } catch (error) {
      console.error("Error sending chore claimed notifications:", error);
      return null;
    }
  }

  return null;
});

export const notifyOnChoreCompleted = onDocumentCreated("activities/{activityId}", async (event) => {
  const snap = event.data;
  if (!snap) return null;

  const newActivity = snap.data();
  
  // We only want to notify when a chore is actually completed
  if (newActivity.type !== 'chore_completion') return null;

  const householdId = newActivity.householdId;
  const completerId = newActivity.userId;
  const choreTitle = newActivity.choreTitle;
  const points = newActivity.points || 0;

  if (!householdId || !completerId) return null;

  try {
    // Fetch the user's latest accurate name
    let completerName = "Someone";
    const completerDoc = await db.collection("users").doc(completerId).get();
    if (completerDoc.exists) {
        const data = completerDoc.data();
        completerName = data?.householdSettings?.[householdId]?.displayName || data?.displayName || "Someone";
    }

    // 1. Get Household details
    const houseDoc = await db.collection("households").doc(householdId).get();
    if (!houseDoc.exists) return null;
    
    const houseData = houseDoc.data();
    const members = houseData?.members || {};
    const householdName = houseData?.name || "your household";

    // 2. Find everyone EXCEPT the person who completed the chore
    const memberIds = Object.keys(members).filter((id) => id !== completerId);
    if (memberIds.length === 0) return null;

    // 3. Get their Expo Push Tokens from their user profiles
    const tokens: string[] = [];
    const usersSnap = await db
      .collection("users")
      .where(admin.firestore.FieldPath.documentId(), "in", memberIds)
      .get();

    usersSnap.forEach((doc) => {
      const userData = doc.data();
      if (userData.expoPushToken && Expo.isExpoPushToken(userData.expoPushToken)) {
        tokens.push(userData.expoPushToken);
      }
    });

    if (tokens.length === 0) return null;

    // 4. Create the notification messages
    const messages = tokens.map(token => ({
      to: token,
      sound: "default" as const,
      title: `Chore Completed! 🧹`,
      body: `${completerName} just finished "${choreTitle}" in ${householdName} and earned ${points} points!`,
      data: { route: "/chores" }, 
    }));

    // 5. Send them via Expo
    const chunks = expo.chunkPushNotifications(messages as any);
    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }

    return null;
  } catch (error) {
    console.error("Error sending chore completed notifications:", error);
    return null;
  }
});

export const notifyOnNewMemberJoined = onDocumentUpdated("households/{householdId}", async (event) => {
  const snap = event.data;
  if (!snap) return null;

  const beforeData = snap.before.data();
  const afterData = snap.after.data();

  const beforeMembers = beforeData.members || {};
  const afterMembers = afterData.members || {};

  const beforeMemberIds = Object.keys(beforeMembers);
  const afterMemberIds = Object.keys(afterMembers);

  // Check if someone new was added to the members map
  const newMemberIds = afterMemberIds.filter(id => !beforeMemberIds.includes(id));

  // If no new members were added, exit early
  if (newMemberIds.length === 0) return null;

  const householdName = afterData.name || "your household";

  try {
    for (const newMemberId of newMemberIds) {
      // 1. Get the new member's name
      const newMemberDoc = await db.collection("users").doc(newMemberId).get();
      const newMemberName = newMemberDoc.data()?.displayName || "Someone";

      // 2. Find everyone to notify (all members EXCEPT the new person)
      const usersToNotifyIds = afterMemberIds.filter(id => id !== newMemberId);
      if (usersToNotifyIds.length === 0) continue;

      // 3. Get their Expo Push Tokens
      const tokens: string[] = [];
      const usersSnap = await db
        .collection("users")
        .where(admin.firestore.FieldPath.documentId(), "in", usersToNotifyIds)
        .get();

      usersSnap.forEach((doc) => {
        const userData = doc.data();
        if (userData.expoPushToken && Expo.isExpoPushToken(userData.expoPushToken)) {
          tokens.push(userData.expoPushToken);
        }
      });

      if (tokens.length === 0) continue;

      // 4. Create the notification messages
      const messages = tokens.map(token => ({
        to: token,
        sound: "default" as const,
        title: `New Household Member! 👋`,
        body: `${newMemberName} just joined ${householdName}. Say hi!`,
        data: { route: "/profile" }, // Routing them to the profile/household management screen
      }));

      // 5. Send them via Expo
      const chunks = expo.chunkPushNotifications(messages as any);
      for (const chunk of chunks) {
        await expo.sendPushNotificationsAsync(chunk);
      }
    }

    return null;
  } catch (error) {
    console.error("Error sending new member notification:", error);
    return null;
  }
});