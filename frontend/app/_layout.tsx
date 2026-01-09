import { useEffect } from "react";
import "./globals.css";
import { Slot, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "@/context/AuthContext";


function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      // Not logged in -> Go to Sign In
      router.replace("/(auth)/signin");
    } else if (session && inAuthGroup) {
      // Logged in -> Go to Home
      router.replace("/(app)/(tabs)");
    }
  }, [session, segments, isLoading]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}