import * as admin from "firebase-admin";
import { Expo } from "expo-server-sdk";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

export const db = admin.firestore();
export const expo = new Expo();