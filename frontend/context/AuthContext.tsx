import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useContext, createContext, useState, useEffect, ReactNode } from "react";
import { auth, db } from "../config/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  User,
  UserCredential,
  GoogleAuthProvider,
  signInWithCredential
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useRouter, useSegments } from "expo-router";
import Toast from "react-native-toast-message";

async function registerForPushNotificationsAsync(userId: string) {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#63B995',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    // Gets the projectId from app.json
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || "ee038744-8a7a-4e7e-8029-c0242305e760";
    
    try {
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      // Save token to this user's Firestore document
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { expoPushToken: token });
    } catch (error) {
      console.error("Error fetching push token:", error);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }
}

interface AuthContextType {
  user: User | null;
  signin: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userName: string) => Promise<UserCredential | undefined>;
  logout: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
  updateAvatar: (avatar: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // 1. Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: "855393255122-ot5ev9t7j04jk27iqabtu2907hern01d.apps.googleusercontent.com",
    });

    // 2. Listen for login/logout changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      // If user just logged in, register their device!
      if (user) {
        await registerForPushNotificationsAsync(user.uid);
      }

      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Handle Protected Redirects
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      // If NOT logged in and NOT in auth screens, go to Sign In
      router.replace("/(auth)/signin");
    } else if (user && inAuthGroup) {
      // If logged in and TRYING to go to auth screens, go to Home
      router.replace("/");
    }
  }, [user, loading, segments]);

  const signin = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Sign In Failed',
        text2: error.message
      });
    }
  };

  const register = async (email: string, password: string, userName: string) => {
    try {
      // 1. Create Account
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = credential.user;
      // 2. Update Auth Profile with the CUSTOM username
      await updateProfile(newUser, { displayName: userName });
      // 3. Create Firestore Document
      await setDoc(doc(db, "users", newUser.uid), {
        displayName: userName,
        email: email,
        photoURL: null,
      });
      // 4. Force Local State Update
      setUser({ ...newUser, displayName: userName });

      return credential;
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error.message
      });
    }
  };

  const googleSignIn = async () => {
    try {
      // 1. Check for Play Services
      await GoogleSignin.hasPlayServices();
      
      // 2. Sign In with Google
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;

      if (!idToken) {
        throw new Error("No ID token found");
      }

      // 3. Create Firebase Credential
      const credential = GoogleAuthProvider.credential(idToken);
      
      // 4. Sign In with Firebase
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // 5. Create Firestore User Document if it doesn't exist
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          displayName: user.displayName || "Google User",
          email: user.email,
          photoURL: user.photoURL,
        });
      }

    } catch (error: any) {
      // Code 12501 is "User Cancelled" - we don't need to show an error for that
      if (error.code !== '12501') {
        console.error("Google Sign-In Error:", error);
        Toast.show({
          type: 'error',
          text1: 'Google Sign-In Failed',
          text2: error.message
        });
      }
    }
  };

  // Update Name in Auth AND Firestore
  const updateName = async (name: string) => {
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName: name });
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userRef, { displayName: name }, { merge: true });
        await auth.currentUser.reload();
        setUser({ ...auth.currentUser });
      } catch (error) {
        console.error("Failed to update name:", error);
        throw error;
      }
    }
  };

  // Update Avatar in Auth AND Firestore
  const updateAvatar = async (avatar: string) => {
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { photoURL: avatar });
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userRef, { photoURL: avatar }, { merge: true });
        await auth.currentUser.reload();
        setUser({ ...auth.currentUser });
      } catch (error) {
        console.error("Failed to update avatar:", error);
        throw error;
      }
    }
  };

  const logout = async () => {
    try {
      await GoogleSignin.signOut(); // Clear Google session
      await signOut(auth); // Clear Firebase session
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signin, register, logout, updateName, updateAvatar, googleSignIn, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);