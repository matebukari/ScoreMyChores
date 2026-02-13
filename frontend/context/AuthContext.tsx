import { useContext, createContext, useState, useEffect, ReactNode } from "react";
import { auth, db } from "../config/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  User,
  UserCredential
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter, useSegments } from "expo-router";
import Toast from "react-native-toast-message";

interface AuthContextType {
  user: User | null,
  signin: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, userName: string) => Promise<UserCredential | undefined>,
  logout: () => Promise<void>,
  updateName: (name: string) => Promise<void>,
  updateAvatar: (avatar: string) => Promise<void>;
  loading: boolean,
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  // Listen for login/logout changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
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
  }

  // Update Name in Auth AND Firestore
  const updateName = async (name: string) => {
    if (auth.currentUser) {
      try {
        // Update Auth Profile (Local)
        await updateProfile(auth.currentUser, { displayName: name });
        
        // Update Firestore Document (Public)
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userRef, { displayName: name }, { merge: true });

        // Force Local Refresh
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
        // Update Auth Profile (Local)
        await updateProfile(auth.currentUser, { photoURL: avatar });
        
        // Update Firestore Document (Public)
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userRef, { photoURL: avatar }, { merge: true });

        // Force Local Refresh
        await auth.currentUser.reload();
        setUser({ ...auth.currentUser }); 
      } catch (error) {
        console.error("Failed to update avatar:", error);
        throw error;
      }
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, signin, register, logout, updateName, updateAvatar, loading }}>
      {children}
    </AuthContext.Provider>
  );
}


export const useAuth = () => useContext(AuthContext);