import "./globals.css";
import { Slot } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { HouseholdProvider } from "@/context/HouseholdContext";
import { ChoreProvider } from "@/context/ChoreContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message"

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <HouseholdProvider>
          <ChoreProvider>
            <Slot/>
            <StatusBar style="dark" translucent={true} backgroundColor="transparent"/>
            <Toast  visibilityTime={4000} position="top" topOffset={60} autoHide={true}/>
          </ChoreProvider>
        </HouseholdProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}