import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Share,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useHousehold } from "@/context/HouseholdContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { householdService } from "@/services/householdService";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Components
import UserInfoCard from "@/components/profile/UserInfoCard";
import HouseholdInfoCard from "@/components/profile/HouseholdInfoCard";
import HouseholdSwitcher from "@/components/profile/HouseholdSwitcher";
import EditNameModal from "@/components/profile/modals/EditNameModal";
import AvatarPickerModal from "@/components/profile/modals/AvatarPickerModal";
import ManageMembersModal from "@/components/profile/modals/ManageMembersModal";
import JoinHouseholdModal from "@/components/profile/modals/JoinHouseholdModal";

export default function ProfileScreen() {
  const { user, logout, updateName, updateAvatar } = useAuth();
  const { activeHousehold, joinedHouseholds, switchHousehold, loading, memberProfiles } = useHousehold();

  // State
  const [switching, setSwitching] = useState(false);
  const [householdNames, setHouseholdNames] = useState<Record<string, string>>({});
  

  // Modal Visibility State
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [isEditNameVisible, setIsEditNameVisible] = useState(false);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [isManageMemberVisible, setIsManageMemberVisible] = useState(false);

  // Operation State
  const [joining, setJoining] = useState(false);
  const [updatingName, setUpdatingName] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  const insets = useSafeAreaInsets();
  const safeTop = insets.top > 0 ? insets.top : (Platform.OS === 'android' ? 30 : 0);

  const isAdmin = activeHousehold?.members?.[user?.uid || ""] === "admin";

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
      await updateAvatar(avatar);
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
      {text: "Cancel", style: "cancel" },
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
          role={activeHousehold?.members[user?.uid || ""] === "admin" ? "admin" : "member"}
          onEditName={() => setIsEditNameVisible(true)}
          onEditAvatar={() => setIsAvatarModalVisible(true)}
        />

        <Text style={styles.sectionTitle}>Current Household</Text>

        {/* HOUSEHOLD INFO */}
        <HouseholdInfoCard
          household={activeHousehold}
          loading={loading || switching}
          isAdmin={isAdmin}
          onShareCode={handleShareCode}
          onManageMembers={() => setIsManageMemberVisible(true)}
        />

        {/* JOIN BUTTON */}
        <TouchableOpacity style={styles.joinButton} onPress={() => setIsJoinModalVisible(true)}>
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
          members={Object.values(memberProfiles).filter(m => m.id !== user?.uid)}
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
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 15 },
  joinButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#fff", padding: 15, borderRadius: 12, marginBottom: 25, borderWidth: 1, borderColor: "#63B995", borderStyle: "dashed" },
  joinButtonText: { color: "#63B995", fontWeight: "600", marginLeft: 8 },
  logoutButton: { backgroundColor: "#ffebee", padding: 15, borderRadius: 12, alignItems: "center", marginTop: 10 },
  logoutText: { color: "#d32f2f", fontWeight: "bold", fontSize: 16 },
});