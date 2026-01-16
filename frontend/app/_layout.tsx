import "./globals.css";
import { Slot } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { HouseholdProvider } from "@/context/HouseholdContext";


export default function RootLayout() {
  return (
    <AuthProvider>
      <HouseholdProvider>
        <Slot/>
      </HouseholdProvider>
    </AuthProvider>
  );
}