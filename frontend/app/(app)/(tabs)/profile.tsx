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

import { useProfileScreen } from "@/hooks/useProfileScreen";

import UserInfoCard from "@/components/profile/UserInfoCard";
import HouseholdInfoCard from "@/components/profile/HouseholdInfoCard";
import HouseholdSwitcher from "@/components/profile/HouseholdSwitcher";
import EditNameModal from "@/components/profile/modals/EditNameModal";
import AvatarPickerModal from "@/components/profile/modals/AvatarPickerModal";
import ManageMembersModal from "@/components/profile/modals/ManageMembersModal";
import JoinHouseholdModal from "@/components/profile/modals/JoinHouseholdModal";

export default function ProfileScreen() {
  const {
    // Data
    user,
    activeHousehold,
    joinedHouseholds,
    memberProfiles,
    householdNames,
    householdLoading,
    isAdmin,
    // UI State
    switching,
    joining,
    updatingName,
    updatingRole,
    // Modals
    isJoinModalVisible,
    setIsJoinModalVisible,
    isEditNameVisible,
    setIsEditNameVisible,
    isAvatarModalVisible,
    setIsAvatarModalVisible,
    isManageMemberVisible,
    setIsManageMemberVisible,
    // Actions
    handleSignOut,
    handleShareCode,
    handleSwitch,
    handleJoinHousehold,
    handleUpdateName,
    handleSelectAvatar,
    handleUpdateRole,
  } = useProfileScreen();

  const insets = useSafeAreaInsets();
  const safeTop =
    insets.top > 0 ? insets.top : Platform.OS === "android" ? 30 : 0;

  return (
    <View style={[styles.container, { paddingTop: safeTop }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* USER INFO CARD */}
        <UserInfoCard
          user={user}
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
          onShareCode={handleShareCode}
          onManageMembers={() => setIsManageMemberVisible(true)}
        />

        {/* JOIN BUTTON */}
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => setIsJoinModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={22} color="#63B995" />
          <Text style={styles.joinButtonText}>Join Another Household</Text>
        </TouchableOpacity>

        {/* SWITCH LIST */}
        <HouseholdSwitcher
          joinedHouseholds={joinedHouseholds}
          activeHouseholdId={activeHousehold?.id}
          householdNames={householdNames}
          switching={switching}
          onSwitch={handleSwitch}
        />

        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
        <View style={{ height: 50 }} />

        {/* --- MODALS --- */}

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
          currentName={user?.displayName}
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
          members={Object.values(memberProfiles).filter(
            (m) => m.id !== user?.uid,
          )}
          householdMembersMap={activeHousehold?.members}
          currentUserId={user?.uid}
          onUpdateRole={handleUpdateRole}
          updatingRole={updatingRole}
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
  joinButtonText: { color: "#63B995", fontWeight: "600", marginLeft: 8 },
  logoutButton: {
    backgroundColor: "#ffebee",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  logoutText: { color: "#d32f2f", fontWeight: "bold", fontSize: 16 },
});
