import "./globals.css";
import { Slot } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { HouseholdProvider } from "@/context/HouseholdContext";
import { ChoreProvider } from "@/context/ChoreContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";


export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <HouseholdProvider>
          <ChoreProvider>
            <Slot/>
            <StatusBar style="dark" translucent={true} backgroundColor="transparent"/>
          </ChoreProvider>
        </HouseholdProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}