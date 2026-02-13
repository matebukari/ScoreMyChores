import { useState } from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
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
      Toast.show({
        type: 'error',
        text1: 'Permission Denied',
        text2: 'Only the household admin can delete chores.'
      });
      return;
    }
    Alert.alert("Delete Chore", "Are you sure you want to remove this chore?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            await choreService.deleteChore(id);
            Toast.show({ type: 'success', text1: 'Chore Deleted' });
          } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Could not delete chore.'})
          }
        } 
      },
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
            Toast.show({ type: 'success', text1: 'All Chores Deleted' });
          } catch (error) {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Failed to delete all chores.'
            });
          }
        },
      },
    ]);
  };

  const handleResetAll = () => {
    Alert.alert("Reset All", "Make all chores 'Pending' again?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Reset",
        onPress: async () => {
          await resetAll();
          Toast.show({ type: 'success', text1: 'Chores Reset', text2: 'All chores are now pending.' });
        }
      },
    ]);
  };

  const handleResetSingle = (id: string) => {
    Alert.alert("Reset Chore", "Make this chore available again?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Reset",
        onPress: async () => {
          await resetChore(id);
          Toast.show({ type: 'success', text1: 'Chore Reset' });
        } 
      },
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