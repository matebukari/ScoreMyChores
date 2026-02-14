import { useState, useMemo } from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "@/context/AuthContext";
import { useHousehold } from "@/context/HouseholdContext";
import { useChores } from "@/context/ChoreContext";
import { choreService } from "@/services/choreService";

const POINT_OPTIONS = ["10", "20", "30", "50", "100"];

export function useChoresScreen() {
  const { user } = useAuth();
  const { activeHousehold, memberProfiles } = useHousehold();
  const { 
    chores, 
    addChore, 
    loading, 
    resetAll, 
    resetChore, 
    activities 
  } = useChores();

  const [isModalVisible, setIsModalVisible] = useState(false);

  // Add Chore Form State
  const [choreTitle, setChoreTitle] = useState("");
  const [chorePoints, setChorePoints] = useState("");
  const [showPointOptions, setShowPointOptions] = useState(false);
  const [isAddingChore, setIsAddingChore] = useState(false);

  // Scheduler State
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());
  const [selectedMinute, setSelectedMinute] = useState(new Date().getMinutes());

  // Check if current user is admin
  const isAdmin = activeHousehold?.members?.[user?.uid || ""] === "admin";

  const recentTasks = useMemo(() => {
    const unique = new Map<string, number>();

    for (const act of activities) {
      const data = act as any;
      if (data.choreTitle && data.points && !unique.has(data.choreTitle)) {
        unique.set(data.choreTitle, data.points);
      }
      if (unique.size >= 5) break;
    }
    return Array.from(unique.entries()).map(([t, p]) => ({ title: t, points: p }));
  }, [activities]);

  const handlePointChange = (text: string) => {
    const cleanedText = text.replace(/[^0-9]/g, "");

    if (cleanedText === "") {
      setChorePoints("");
      return;
    }

    const num = parseInt(cleanedText, 10);

    if (num > 100) {
      Toast.show({
        type: 'error',
        text1: 'Limit Reached',
        text2: 'Maximum points allowed is 100.'
      });
      setChorePoints("100");
    } else if (num === 0) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Value',
        text2: 'Points must be at least 1.'
      });
      setChorePoints("");
    } else {
      setChorePoints(num.toString());
    }
  };

  const handleSelectRecent = (taskTitle: string, taskPoints: number) => {
    setChoreTitle(taskTitle);
    setChorePoints(taskPoints.toString());
  };

  const resetForm = () => {
    setChoreTitle("");
    setChorePoints("");
    setShowPointOptions(false);
    setShowScheduler(false);
    const now = new Date();
    setSelectedDate(now);
    setSelectedHour(now.getHours());
    setSelectedMinute(now.getMinutes());
  };

  const handleAddChoreSubmit = async () => {
    if (!choreTitle || !chorePoints) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill in all fields'
      });
      return;
    }

    const numericPoints = parseInt(chorePoints, 10);
    if (isNaN(numericPoints) || numericPoints < 1 || numericPoints > 100) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Points',
        text2: 'Please enter a number between 1 and 100.'
      });
      return;
    }

    try {
      setIsAddingChore(true);

      let scheduledFor = null;
      if (showScheduler) {
        scheduledFor = new Date(selectedDate);
        scheduledFor.setHours(selectedHour);
        scheduledFor.setMinutes(selectedMinute);

        // Validation
        const now = new Date();
        if (scheduledFor < now) {
          Toast.show({
            type: 'error',
            text1: 'Invalid Time',
            text2: 'You cannot schedule a task for the past.'
          });
          setIsAddingChore(false);
          return;
        }
      }

      await addChore(choreTitle, numericPoints, scheduledFor);

      resetForm();
      setIsModalVisible(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add chore'
      });
    } finally {
      setIsAddingChore(false);
    }
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
    // Add Chore Form Props
    choreTitle, setChoreTitle,
    chorePoints, setChorePoints,
    handlePointChange,
    showPointOptions, setShowPointOptions,
    isAddingChore,
    showScheduler, setShowScheduler,
    selectedDate, setSelectedDate,
    selectedHour, setSelectedHour,
    selectedMinute, setSelectedMinute,
    recentTasks,
    handleSelectRecent,
    POINT_OPTIONS
  };
}