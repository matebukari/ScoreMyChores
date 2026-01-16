import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useHousehold } from "@/context/HouseholdContext";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const { activeHouseholdId, loading: householdLoading } = useHousehold();

  // Show loading spinner while checking Firebase
  if (authLoading || householdLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  // Not Logged In? -> Go to Login
  if (!user) {
    return <Redirect href="/signin" />;
  }

  // Logged In, but NO Household? -> Go to Setup
  if (!activeHouseholdId) {
    return <Redirect href="/setup" />;
  }

  // Logged In AND Has Household? -> Go to Main App
  return <Redirect href="/(app)/(tabs)" />;
}