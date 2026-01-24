import { useContext, createContext, useState, useEffect, ReactNode } from "react";
import { auth } from "../config/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  User,
  UserCredential
} from "firebase/auth";
import { useRouter, useSegments } from "expo-router";

interface AuthContextType {
  user: User | null,
  signin: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<UserCredential | undefined>,
  logout: () => Promise<void>,
  updateName: (name: string) => Promise<void>,
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
      alert(error.message);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      alert(error.message);
    }
  }

  // Function to update display name
  const updateName = async (name: string) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: name });
      setUser({ ...auth.currentUser });
    }
  }

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, signin, register, logout, updateName, loading }}>
      {children}
    </AuthContext.Provider>
  );
}


export const useAuth = () => useContext(AuthContext);