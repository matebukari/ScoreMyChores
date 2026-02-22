import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import { Expo } from "expo-server-sdk";

admin.initializeApp();
const db = admin.firestore();
const expo = new Expo();

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