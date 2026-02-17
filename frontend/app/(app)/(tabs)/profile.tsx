import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useProfileScreen } from "@/hooks/useProfileScreen";

import UserInfoCard from "@/components/profile/UserInfoCard";
import HouseholdInfoCard from "@/components/profile/HouseholdInfoCard";
import HouseholdSwitcher from "@/components/profile/HouseholdSwitcher";
import ThemeToggle from "@/components/profile/ThemeToggle";

import EditNameModal from "@/components/profile/modals/EditNameModal";
import AvatarPickerModal from "@/components/profile/modals/AvatarPickerModal";
import ManageMembersModal from "@/components/profile/modals/ManageMembersModal";
import JoinHouseholdModal from "@/components/profile/modals/JoinHouseholdModal";
import CreateHouseholdModal from "@/components/profile/modals/CreateHouseholdModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function ProfileScreen() {
  const {
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
    // Modals
    isJoinModalVisible,
    setIsJoinModalVisible,
    isEditNameVisible,
    setIsEditNameVisible,
    isAvatarModalVisible,
    setIsAvatarModalVisible,
    isManageMemberVisible,
    setIsManageMemberVisible,
    isCreateModalVisible,
    setIsCreateModalVisible,
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
  } = useProfileScreen();

  // --- LOCAL STATE FOR MODAL INPUTS ---
  const [inviteCode, setInviteCode] = useState("");
  const [editName, setEditName] = useState("");
  const [newHouseholdName, setNewHouseholdName] = useState("");

  // Sync the edit name input when the modal opens or user data changes
  useEffect(() => {
    if (isEditNameVisible) {
      setEditName(currentUserProfile?.displayName || user?.displayName || "");
    }
  }, [isEditNameVisible, currentUserProfile, user]);

  const insets = useSafeAreaInsets();
  const safeTop =
    insets.top > 0 ? insets.top : Platform.OS === "android" ? 30 : 0;

  return (
    <View 
      className="flex-1 bg-background dark:bg-background-dark px-5"
      style={{ paddingTop: safeTop }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mt-10 mb-5">
          <Text className="text-3xl font-bold text-text-main dark:text-text-inverted">
            Profile
          </Text>
        </View>

        {/* USER INFO CARD */}
        <UserInfoCard
          user={user}
          name={currentUserProfile?.displayName}
          avatar={currentUserProfile?.photoURL}
          role={
            activeHousehold?.members[user?.uid || ""] === "admin"
              ? "admin"
              : "member"
          }
          onEditName={() => setIsEditNameVisible(true)}
          onEditAvatar={() => setIsAvatarModalVisible(true)}
        />

        <Text className="text-lg font-bold text-text-main dark:text-text-inverted mb-[15px]">
          Current Household
        </Text>

        {/* HOUSEHOLD INFO */}
        <HouseholdInfoCard
          household={activeHousehold}
          loading={householdLoading || switching}
          isAdmin={isAdmin}
          userPoints={totalPoints}
          onShareCode={handleShareCode}
          onManageMembers={() => setIsManageMemberVisible(true)}
          onLeave={handleLeaveHousehold}
          onDelete={handleDeleteHousehold}
          leaving={leaving}
          deleting={deleting}
        />

        {/* ACTION BUTTONS ROW */}
        <View className="flex-row gap-[15px] mb-[25px]">
          {/* JOIN BUTTON */}
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center p-[15px] rounded-xl bg-white dark:bg-card-dark border border-light-100 border-dashed"
            onPress={() => setIsJoinModalVisible(true)}
          >
            <Ionicons name="enter-outline" size={22} color="#63B995" />
            <Text className="text-light-100 font-semibold ml-2">
              Join
            </Text>
          </TouchableOpacity>

          {/* CREATE BUTTON */}
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center p-[15px] rounded-xl bg-light-100 shadow-sm elevation-4"
            style={{ shadowColor: "#63B995" }} // Keep specific shadow color inline
            onPress={() => setIsCreateModalVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={22} color="#fff" />
            <Text className="text-white font-bold ml-2">
              Create
            </Text>
          </TouchableOpacity>
        </View>

        {/* SWITCH LIST */}
        <HouseholdSwitcher
          joinedHouseholds={joinedHouseholds}
          activeHouseholdId={activeHousehold?.id}
          householdNames={householdNames}
          switching={switching}
          onSwitch={handleSwitch}
        />

        <ThemeToggle />

        <TouchableOpacity 
          className="bg-danger-bg dark:bg-red-900/20 p-[15px] rounded-xl items-center mt-2.5"
          onPress={handleSignOut}
        >
          <Text className="text-danger dark:text-red-400 font-bold text-base">
            Sign Out
          </Text>
        </TouchableOpacity>
        
        <View className="h-[50px]" />

        {/* --- MODALS --- */}
        <ConfirmationModal
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          confirmText={alertConfig.confirmText}
          isDestructive={alertConfig.isDestructive}
          onConfirm={alertConfig.onConfirm}
          onCancel={closeAlert}
        />

        {/* 1. JOIN MODAL */}
        <JoinHouseholdModal
          visible={isJoinModalVisible}
          onClose={() => {
            setIsJoinModalVisible(false);
            setInviteCode("");
          }}
          inviteCode={inviteCode}
          setInviteCode={setInviteCode}
          onJoin={() => handleJoinHousehold(inviteCode)}
          loading={joining}
        />

        {/* 2. EDIT NAME MODAL */}
        <EditNameModal
          visible={isEditNameVisible}
          onClose={() => setIsEditNameVisible(false)}
          name={editName}
          setName={setEditName}
          onSave={() => handleUpdateName(editName)}
          loading={updatingName}
        />

        {/* 3. AVATAR PICKER MODAL */}
        <AvatarPickerModal
          visible={isAvatarModalVisible}
          onClose={() => setIsAvatarModalVisible(false)}
          onSelect={handleSelectAvatar}
        />

        {/* 4. MANAGE MEMBERS MODAL */}
        <ManageMembersModal
          visible={isManageMemberVisible}
          onClose={() => setIsManageMemberVisible(false)}
          members={Object.values(memberProfiles)}
          householdMembersMap={activeHousehold?.members}
          currentUserId={user?.uid}
          onUpdateRole={handleUpdateRole}
          updatingRole={updatingRole}
          onRemoveMember={handleRemoveMember}
          removingMember={removingMember}
        />

        {/* 5. CREATE MODAL */}
        <CreateHouseholdModal
          visible={isCreateModalVisible}
          onClose={() => {
            setIsCreateModalVisible(false);
            setNewHouseholdName("");
          }}
          householdName={newHouseholdName}
          setHouseholdName={setNewHouseholdName}
          onCreate={() => handleCreateHousehold(newHouseholdName)}
          loading={creating}
        />
      </ScrollView>
    </View>
  );
}