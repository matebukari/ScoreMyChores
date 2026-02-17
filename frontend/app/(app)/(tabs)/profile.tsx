import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";

import { useProfileScreen } from "@/hooks/useProfileScreen";

import UserInfoCard from "@/components/profile/UserInfoCard";
import HouseholdInfoCard from "@/components/profile/HouseholdInfoCard";
import HouseholdSwitcher from "@/components/profile/HouseholdSwitcher";
import ThemeToggle from "@/components/profile/ThemeToggle";

import EditNameModal from "@/components/profile/modals/EditNameModal";
import AvatarPickerModal from "@/components/profile/modals/AvatarPickerModal";
import ManageMembersModal from "@/components/profile/modals/ManageMembersModal";
import JoinHouseholdModal from "@/components/profile/modals/JoinHouseholdModal";
import CreatHouseholdModal from "@/components/profile/modals/CreateHouseholdModal";
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

  const insets = useSafeAreaInsets();
  const safeTop =
    insets.top > 0 ? insets.top : Platform.OS === "android" ? 30 : 0;

  return (
    <View style={[styles.container, { paddingTop: safeTop }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
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

        <Text style={styles.sectionTitle}>Current Household</Text>

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
        <View style={styles.actionRow}>
          {/* JOIN BUTTON */}
          <TouchableOpacity
            style={[styles.actionButton, styles.joinButtonOutline]}
            onPress={() => setIsJoinModalVisible(true)}
          >
            <Ionicons name="enter-outline" size={22} color="#63B995" />
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        
          {/* CREATE BUTTON */}
          <TouchableOpacity
            style={[styles.actionButton, styles.createButtonFill]}
            onPress={() => setIsCreateModalVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={22} color="#fff" />
            <Text style={styles.createButtonText}>Create</Text>
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

        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
        <View style={{ height: 50 }} />

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
          onClose={() => setIsJoinModalVisible(false)}
          onJoin={handleJoinHousehold}
          loading={joining}
        />

        {/* 2. EDIT NAME MODAL */}
        <EditNameModal
          visible={isEditNameVisible}
          onClose={() => setIsEditNameVisible(false)}
          currentName={currentUserProfile?.displayName || user?.displayName}
          onSave={handleUpdateName}
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
        <CreatHouseholdModal
          visible={isCreateModalVisible}
          onClose={() => setIsCreateModalVisible(false)}
          onCreate={handleCreateHousehold}
          loading={creating}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", paddingHorizontal: 20 },
  header: { marginTop: 40, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#333" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#63B995",
    borderStyle: "dashed",
  },
  logoutButton: {
    backgroundColor: "#ffebee",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  logoutText: { color: "#d32f2f", fontWeight: "bold", fontSize: 16 },
  actionRow: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 25,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12,
  },
  joinButtonOutline: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#63B995",
    borderStyle: "dashed",
  },
  createButtonFill: {
    backgroundColor: "#63B995",
    shadowColor: "#63B995",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  joinButtonText: { color: "#63B995", fontWeight: "600", marginLeft: 8 },
  createButtonText: { color: "#fff", fontWeight: "bold", marginLeft: 8 },
});
