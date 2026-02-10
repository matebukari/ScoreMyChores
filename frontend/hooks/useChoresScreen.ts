import { useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useHousehold } from "@/context/HouseholdContext";
import { useChores } from "@/context/ChoreContext";
import { choreService } from "@/services/choreService";

export function useChoresScreen() {
  const { user } = useAuth();
  const { activeHousehold, memberProfiles } = useHousehold();
  const { chores, addChore, loading, resetAll, resetChore } = useChores();

  const [isModalVisible, setIsModalVisible] = useState(false);

  // Check if current user is admin
  const isAdmin = activeHousehold?.members?.[user?.uid || ""] === "admin";

  const handleAddChoreSubmit = async (title: string, points: number, scheduledFor: Date | null) => {
    await addChore(title, points, scheduledFor);
    setIsModalVisible(false);
  };

  const handleDeleteChore = (id: string) => {
    if (!isAdmin) {
      Alert.alert("Permission Denied", "Only the household admin can delete chores.");
      return;
    }
    Alert.alert("Delete Chore", "Are you sure you want to remove this chore?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => await choreService.deleteChore(id) },
    ]);
  };

  const handleDeleteAll = () => {
    if (!isAdmin || chores.length === 0) return;
    Alert.alert("Delete ALL Chores", "WARNING: This will remove every single task.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete All",
        style: "destructive",
        onPress: async () => {
          try {
            const promises = chores.map((chore) => choreService.deleteChore(chore.id));
            await Promise.all(promises);
          } catch (error) {
            Alert.alert("Error", "Failed to delete all chores.");
          }
        },
      },
    ]);
  };

  const handleResetAll = () => {
    Alert.alert("Reset All", "Make all chores 'Pending' again?", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", onPress: resetAll },
    ]);
  };

  const handleResetSingle = (id: string) => {
    Alert.alert("Reset Chore", "Make this chore available again?", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", onPress: async () => await resetChore(id) },
    ]);
  };

  return {
    chores,
    loading,
    memberProfiles,
    currentUserId: user?.uid,
    isAdmin,
    isModalVisible,
    setIsModalVisible,
    handleAddChoreSubmit,
    handleDeleteChore,
    handleDeleteAll,
    handleResetAll,
    handleResetSingle,
  };
}