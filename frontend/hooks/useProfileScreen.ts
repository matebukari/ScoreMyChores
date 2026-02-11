import { useState, useEffect } from "react";
import { Alert, Share } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useHousehold } from "@/context/HouseholdContext";
import { householdService } from "@/services/householdService";

export const useProfileScreen = () => {
  const { user, logout, updateName, updateAvatar } = useAuth();
  const { 
    activeHousehold, 
    joinedHouseholds, 
    switchHousehold, 
    loading: householdLoading, 
    memberProfiles 
  } = useHousehold();

  // Data State
  const [householdNames, setHouseholdNames] = useState<Record<string, string>>({});
  
  // Modal Visibility State
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [isEditNameVisible, setIsEditNameVisible] = useState(false);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [isManageMemberVisible, setIsManageMemberVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  // Operation State
  const [switching, setSwitching] = useState(false);
  const [joining, setJoining] = useState(false);
  const [updatingName, setUpdatingName] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Derived State
  const isAdmin = activeHousehold?.members?.[user?.uid || ""] === "admin";

  const currentUserProfile = user ? memberProfiles[user.uid] : null;

  // Fetch Household Names
  useEffect(() => {
    const fetchHouseholdNames = async () => {
      const names: Record<string, string> = {};

      for (const id of joinedHouseholds) {
        if (id === activeHousehold?.id) {
          names[id] = activeHousehold.name;
        } else {
          try {
            const house = await householdService.getHousehold(id);
            names[id] = house ? house.name : "Unknown Household";
          } catch {
            names[id] = "Unknown Household";
          }
        }
      }
      setHouseholdNames(names);
    };

    if (joinedHouseholds.length > 0) fetchHouseholdNames();
  }, [joinedHouseholds, activeHousehold]);

  // Handlers
  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: async () => { await logout(); router.replace("/signin"); } },
    ]);
  };

  const handleShareCode = async () => {
    if (!activeHousehold) return;
    try {
      await Share.share({
        message: `Join my household on ScoreMyChores! Use code: ${activeHousehold.inviteCode}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSwitch = async (houseId: string) => {
    if (houseId === activeHousehold?.id) return;
    try {
      setSwitching(true);
      await switchHousehold(houseId);
    } catch (error) {
      Alert.alert("Error", "Failed to switch.");
    } finally {
      setSwitching(false);
    }
  };

  const handleJoinHousehold = async (code: string) => {
    if (!code || !user) return;
    try {
      setJoining(true);
      await householdService.joinHousehold(user.uid, code.trim().toUpperCase());
      setIsJoinModalVisible(false);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Invalid invite code");
    } finally {
      setJoining(false);
    }
  };

  const handleUpdateName = async (newName: string) => {
    if (!newName.trim()) return;
    try {
      setUpdatingName(true);
      await updateName(newName.trim());
      setIsEditNameVisible(false);
    } catch {
      Alert.alert("Error", "Failed to update name");
    } finally {
      setUpdatingName(false);
    }
  };

  const handleSelectAvatar = async (avatar: string) => {
    try {
      if (user && activeHousehold) {
        await householdService.updateHouseholdAvatar(user.uid, activeHousehold.id, avatar);
      } else {
        await updateAvatar(avatar);
      }
      setIsAvatarModalVisible(false);
    } catch (error) {
      Alert.alert("Error", "Failed to update avatar");
    }
  };

  const handleUpdateRole = async (targetUserId: string, currentRole: 'admin' | 'member') => {
    if (!activeHousehold) return;
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    const action = newRole === 'admin' ? "Promote to Admin" : "Demote to Member";

    Alert.alert(action, `Are you sure you want to change this user's role?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: async () => {
          try {
            setUpdatingRole(targetUserId);
            await householdService.updateMemberRole(activeHousehold.id, targetUserId, newRole);
          } catch {
            Alert.alert("Error", "Failed to update role.");
          } finally {
            setUpdatingRole(null);
          }
        }
      }
    ]);
  };

  const handleCreateHousehold = async (name: string) => {
    if (!user) return;
    try {
      setCreating(true);
      const newHouseId = await householdService.createHousehold(user.uid, name);
      setIsCreateModalVisible(false);
      await switchHousehold(newHouseId);
      Alert.alert("Success", "Household created!");
    } catch (error) {
      Alert.alert("Error", "Failed to create household.");
    } finally {
      setCreating(false);
    }
  };

  return {
    // Data
    user,
    activeHousehold,
    joinedHouseholds,
    memberProfiles,
    currentUserProfile,
    householdNames,
    householdLoading,
    isAdmin,
    // UI State
    switching,
    joining,
    updatingName,
    updatingRole,
    creating,
    // Modal Visibilities
    isJoinModalVisible, setIsJoinModalVisible,
    isEditNameVisible, setIsEditNameVisible,
    isAvatarModalVisible, setIsAvatarModalVisible,
    isManageMemberVisible, setIsManageMemberVisible,
    isCreateModalVisible, setIsCreateModalVisible,
    // Actions
    handleSignOut,
    handleShareCode,
    handleSwitch,
    handleJoinHousehold,
    handleUpdateName,
    handleSelectAvatar,
    handleUpdateRole,
    handleCreateHousehold,
  };
};