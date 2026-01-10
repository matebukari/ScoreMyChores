import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Get these values from your Firebase Console -> Project Settings
const firebaseConfig = {
  apiKey: process.env.EXPO_Public_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_Public_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_Public_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

// We use initializeAuth instead of getAuth to support AsyncStorage
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});