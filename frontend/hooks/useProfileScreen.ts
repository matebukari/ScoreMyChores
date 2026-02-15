import { useState, useEffect, useMemo } from "react";
import { Share } from "react-native";
import Toast from "react-native-toast-message";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useHousehold } from "@/context/HouseholdContext";
import {useChores } from "@/context/ChoreContext";
import { householdService } from "@/services/householdService";

export const useProfileScreen = () => {
  const { user, logout, updateName, updateAvatar } = useAuth();
  const { activities } = useChores();
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
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    isDestructive: false,
    onConfirm: async () => {},
  });

  const closeAlert = () => setAlertConfig((prev) => ({ ...prev, visible: false }));

  const showConfirmation = (
    title: string, 
    message: string, 
    onConfirm: () => Promise<void> | void, 
    type: 'default' | 'destructive' = 'default',
    confirmText: string = "Confirm"
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      confirmText,
      isDestructive: type === 'destructive',
      onConfirm: async () => {
        await onConfirm();
        closeAlert();
      },
    });
  };

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

  const totalPoints = useMemo(() => {
    if (!user) return 0;
    return activities.reduce((acc, activity) => {
      if (activity.userId === user.uid) {
        return acc + activity.points;
      }
      return acc;
    }, 0);
  }, [activities, user])

  // Handlers
  const handleSignOut = async () => {
    showConfirmation(
      "Sign Out", 
      "Are you sure you want to log out?", 
      async () => { await logout(); router.replace("/signin"); },
      "destructive",
      "Log Out"
    );
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
      Toast.show({ type: 'error', text1: 'Switch Failed', text2: 'Could not switch household.' });
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
      Toast.show({ type: 'success', text1: 'Joined!', text2: 'You have joined the household.' });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Join Failed', text2: error.message || "Invalid invite code" });
    } finally {
      setJoining(false);
    }
  };

  const handleUpdateName = async (newName: string) => {
    if (!newName.trim()) return;
    try {
      setUpdatingName(true);

      if (user && activeHousehold) {
        await householdService.updateHouseholdName(user.uid, activeHousehold.id, newName.trim());
      } else {
        await updateName(newName.trim());
      }
      
      setIsEditNameVisible(false);
      Toast.show({ type: 'success', text1: 'Name Updated' });
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to update name' });
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
      Toast.show({ type: 'success', text1: 'Avatar Updated' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to update avatar' });
    }
  };

  const handleUpdateRole = async (targetUserId: string, currentRole: 'admin' | 'member') => {
    if (!activeHousehold) return;
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    const action = newRole === 'admin' ? "Promote to Admin" : "Demote to Member";

    showConfirmation(
      action,
      `Are you sure you want to change this user's role?`,
      async () => {
        try {
          setUpdatingRole(targetUserId);
          await householdService.updateMemberRole(activeHousehold.id, targetUserId, newRole);
          Toast.show({ type: 'success', text1: 'Role Updated', text2: `User is now a ${newRole}` });
        } catch {
          Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to update role.' });
        } finally {
          setUpdatingRole(null);
        }
      },
      "default"
    );
  };

  const handleCreateHousehold = async (name: string) => {
    if (!user) return;
    try {
      setCreating(true);
      const newHouseId = await householdService.createHousehold(user.uid, name);
      setIsCreateModalVisible(false);
      await switchHousehold(newHouseId);
      Toast.show({ type: 'success', text1: 'Household Created!', text2: `Welcome to ${name}` });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Creation Failed', text2: 'Could not create household.' });
    } finally {
      setCreating(false);
    }
  };

  const handleLeaveHousehold = async () => {
    if (!user || !activeHousehold) return;

    showConfirmation(
      "Leave Household",
      `Are you sure you want to leave "${activeHousehold.name}"?`,
      async () => {
        try {
          setLeaving(true);
          await householdService.leaveHousehold(user.uid, activeHousehold.id);
          Toast.show({ type: 'success', text1: 'Left Household' });
        } catch (error) {
          Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to leave household.' });
        } finally {
          setLeaving(false);
        }
      },
      "destructive",
      "Leave"
    );
  };

  const handleRemoveMember = async (targetUserId: string, memberName: string) => {
    if (!activeHousehold) return;

    showConfirmation(
      "Remove Member",
      `Are you sure you want to remove "${memberName}" from the household?`,
      async () => {
        try {
          setRemovingMember(targetUserId);
          await householdService.removeMember(activeHousehold.id, targetUserId);
          Toast.show({ type: 'success', text1: 'Member Removed' });
        } catch (error) {
          console.error(error);
          Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to remove member.' });
        } finally {
          setRemovingMember(null);
        }
      },
      "destructive",
      "Remove"
    );
  };

  const handleDeleteHousehold = async () => {
    if (!activeHousehold) return;

    showConfirmation(
      "Delete Household",
      `Are you sure you want to PERMANENTLY delete "${activeHousehold.name}"? This action cannot be undone.`,
      async () => {
        try {
          setDeleting(true);
          await householdService.deleteHousehold(activeHousehold.id);
          Toast.show({ type: 'success', text1: 'Household Deleted' });
        } catch (error) {
          Toast.show({ type: 'error', text1: 'Delete Failed', text2: 'Failed to delete household.' });
        } finally {
          setDeleting(false);
        }
      },
      "destructive",
      "Delete"
    );
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
    totalPoints,
    // UI State
    switching,
    joining,
    updatingName,
    updatingRole,
    creating,
    leaving,
    deleting,
    removingMember,
    alertConfig,
    closeAlert,
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
    handleLeaveHousehold,
    handleDeleteHousehold,
    handleRemoveMember,
  };
};