import "./globals.css";
import { Slot } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { HouseholdProvider } from "@/context/HouseholdContext";
import { ChoreProvider } from "@/context/ChoreContext";


export default function RootLayout() {
  return (
    <AuthProvider>
      <HouseholdProvider>
        <ChoreProvider>
          <Slot/>
        </ChoreProvider>
      </HouseholdProvider>
    </AuthProvider>
  );
}