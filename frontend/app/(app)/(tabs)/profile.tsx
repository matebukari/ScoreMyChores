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
  FlatList,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useHousehold, UserProfile } from "@/context/HouseholdContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { householdService } from "@/services/householdService";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";

// List of fun avatars to pick from
const AVATAR_OPTIONS = [
  "🐶", "🐱", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", 
  "🐮", "🐷", "🐸", "🐙", "🦄", "🐲", "👽", "🤖",
  "💩", "👻", "🦸", "🥷", "🧙", "🧚", "🧜", "🧛"
];

// 1. Define the limit constant
const MAX_NAME_LENGTH = 16;

export default function ProfileScreen() {
  const { user, logout, updateName, updateAvatar } = useAuth();
  const { activeHousehold, joinedHouseholds, switchHousehold, loading, memberProfiles } = useHousehold();

  const [switching, setSwitching] = useState(false);
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [joining, setJoining] = useState(false);

  // Edit Name State
  const [isEditNameVisible, setIsEditNameVisible] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || "");
  const [updatingName, setUpdatingName] = useState(false);

  // Edit Avatar State
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);

  // Manage Members State
  const [isManageMemberVisible, setIsManageMemberVisible] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  const [householdNames, setHouseholdNames] = useState<Record<string, string>>({});

  const isAdmin = activeHousehold?.members?.[user?.uid || ""] === "admin";

  const insets = useSafeAreaInsets();
  const safeTop = insets.top > 0 ? insets.top : (Platform.OS === 'android' ? 30 : 0);

  useEffect(() => {
    const fetchHouseholdNames = async () => {
      const names: Record<string, string> = {};

      for (const id of joinedHouseholds) {
        if (id === activeHousehold?.id) {
          names[id] = activeHousehold.name;
        } else {
          try {
            const house = await householdService.getHousehold(id);
            if (house) {
              names[id] = house.name;
            } else {
              names[id] = "Unknown Household";
            }
          } catch (error) {
            console.error("Failed to fetch household name", error);
            names[id] = "Unknown Household";
          }
        }
      }
      setHouseholdNames(names);
    };

    if (joinedHouseholds.length > 0) {
      fetchHouseholdNames();
    }
  }, [joinedHouseholds, activeHousehold]);

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
        message: `Join my household on ChoreApp! Use code: ${activeHousehold.inviteCode}`,
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

  const handleJoinHousehold = async () => {
    if (!inviteCode || !user) return;
    try {
      setJoining(true);
      await householdService.joinHousehold(user.uid, inviteCode.trim().toUpperCase());
      setIsJoinModalVisible(false);
      setInviteCode("");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Invalid invite code");
    } finally {
      setJoining(false);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    
    if (newName.length > MAX_NAME_LENGTH) {
      Alert.alert("Error", `Name must be ${MAX_NAME_LENGTH} characters or less.`);
      return;
    }

    try {
      setUpdatingName(true);
      await updateName(newName.trim());
      setIsEditNameVisible(false);
    } catch (error) {
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
          } catch (error) {
            Alert.alert("Error", "Failed to update role.");
          } finally {
            setUpdatingRole(null);
          }
        }
      }
    ]);
  };

  const displayName = user?.displayName || "User";
  const initial = displayName.charAt(0).toUpperCase();
  const currentAvatar = user?.photoURL;

  const renderMemberItem = ({ item }: { item: UserProfile }) => {
    const role = activeHousehold?.members?.[item.id] || 'member';
    const isMe = item.id === user?.uid;

    return (
      <View style={styles.memberRow}>
        <View style={styles.memberInfo}>
          <Text style={styles.memberAvatar}>{item.photoURL || "👤"}</Text>
          <View>
            <Text style={styles.memberName}>{item.displayName || "Unknown"}</Text>
            <Text style={styles.memberEmail}>{item.email}</Text>
          </View>
        </View>

        <View style={styles.roleContainer}>
          <Text style={[styles.roleBadge, role === 'admin' ? styles.adminBadge : styles.memberBadge]}>
            {role === 'admin' ? "ADMIN" : "MEMBER"}
          </Text>

          {!isMe && (
            <TouchableOpacity
              onPress={() => handleUpdateRole(item.id, role)}
              disabled={!!updatingRole}
              style={styles.roleButton}
            >
              {updatingRole === item.id ? (
                <ActivityIndicator size="small" color="#63B995"/>
              ) : (
                <Ionicons
                  name={role === 'admin' ? "arrow-down-circle-outline" : "arrow-up-circle-outline"}
                  size={24}
                  color="#63B995"
                />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
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
        <View style={styles.card}>
          <View style={{position: 'relative'}}>
            <View style={styles.avatarContainer}>
              {currentAvatar ? (
                <Text style={{ fontSize: 32 }}>{currentAvatar}</Text>
              ) : (
                <Text style={styles.avatarText}>{initial}</Text>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.editAvatarBadge}
              onPress={() => setIsAvatarModalVisible(true)}
            >
              <Ionicons name="camera" size={14} color="white" />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, marginLeft: 15 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.nameText}>{displayName}</Text>
              <TouchableOpacity onPress={() => {
                setNewName(user?.displayName || "");
                setIsEditNameVisible(true);
              }}>
                <Ionicons name="pencil-sharp" size={16} color="#63B995" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.emailText}>{user?.email}</Text>
            <Text style={styles.roleText}>
              Role: {activeHousehold?.members[user?.uid || ""] === "admin" ? "Admin" : "Member"}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Current Household</Text>

        {/* HOUSEHOLD INFO */}
        {loading || switching ? (
          <ActivityIndicator size="large" color="#63B995" />
        ) : activeHousehold ? (
          <View style={styles.houseCard}>
            <View style={styles.houseHeader}>
              <Ionicons name="home" size={24} color="#63B995" />
              <Text style={styles.houseName}>{activeHousehold.name}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.codeRow}>
              <View>
                <Text style={styles.codeLabel}>Invite Code</Text>
                <Text style={styles.codeValue}>{activeHousehold.inviteCode}</Text>
              </View>
              <TouchableOpacity onPress={handleShareCode} style={styles.shareButton}>
                <Ionicons name="share-outline" size={20} color="#63B995" />
              </TouchableOpacity>
            </View>

            {isAdmin && (
              <>
                <View style={styles.divider} />
                  <TouchableOpacity
                    style={styles.manageButton}
                    onPress={() => setIsManageMemberVisible(true)}
                  >
                    <Ionicons name="people-outline" size={20} color="#fff" />
                    <Text style={styles.manageButtonText}>Manage Members</Text>
                  </TouchableOpacity>
              </>
            )}
          </View>
        ) : (
          <Text style={{ color: "#888", marginBottom: 20 }}>No active household.</Text>
        )}

        {/* JOIN BUTTON */}
        <TouchableOpacity style={styles.joinButton} onPress={() => setIsJoinModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={22} color="#63B995" />
          <Text style={styles.joinButtonText}>Join Another Household</Text>
        </TouchableOpacity>

        {/* SWITCH LIST */}
        {joinedHouseholds.length > 1 && (
          <>
            <Text style={styles.sectionTitle}>Switch Household</Text>
            {joinedHouseholds.map((houseId) => (
              <TouchableOpacity
                key={houseId}
                style={[styles.switchButton, houseId === activeHousehold?.id && styles.activeSwitchButton]}
                onPress={() => handleSwitch(houseId)}
              >
                <Text style={[styles.switchText, houseId === activeHousehold?.id && styles.activeSwitchText]}>
                  {householdNames[houseId] || "Loading..."}
                </Text>
                {houseId === activeHousehold?.id && <Ionicons name="checkmark-circle" size={20} color="#63B995" />}
              </TouchableOpacity>
            ))}
          </>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
        <View style={{ height: 50 }} />

        {/* --- MODALS --- */}

        {/* 1. JOIN MODAL */}
        <Modal visible={isJoinModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsJoinModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Join Household</Text>
              <Text style={styles.modalSubtitle}>Enter the invite code from the Admin</Text>
              <TextInput style={styles.input} placeholder="Invite Code (e.g. A1B2C3)" value={inviteCode} onChangeText={setInviteCode} autoCapitalize="characters" />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setIsJoinModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleJoinHousehold} disabled={joining}>
                  {joining ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Join</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* 2. EDIT NAME MODAL */}
        <Modal visible={isEditNameVisible} animationType="fade" transparent={true} onRequestClose={() => setIsEditNameVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Change Name</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={newName}
                onChangeText={setNewName}
                autoCapitalize="words"
                maxLength={MAX_NAME_LENGTH}
              />
              {/* Character Counter */}
              <Text style={styles.charCount}>
                {newName.length}/{MAX_NAME_LENGTH}
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setIsEditNameVisible(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleUpdateName} disabled={updatingName}>
                  {updatingName ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Save</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* 3. AVATAR PICKER MODAL */}
        <Modal visible={isAvatarModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsAvatarModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '60%' }]}>
              <Text style={styles.modalTitle}>Pick an Avatar</Text>
              <FlatList
                data={AVATAR_OPTIONS}
                numColumns={4}
                keyExtractor={(item) => item}
                columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 15 }}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.avatarOption} 
                    onPress={() => handleSelectAvatar(item)}
                  >
                    <Text style={{ fontSize: 32 }}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.button, styles.cancelButton, { marginTop: 10 }]} onPress={() => setIsAvatarModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* 4. MANAGE MEMBERS MODAL */}
        <Modal visible={isManageMemberVisible} animationType="slide" transparent={true} onRequestClose={() => setIsManageMemberVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '70%' }]}>
              <Text style={styles.modalTitle}>Manage Members</Text>
              <Text style={styles.modalSubtitle}>Promote members to admin or remove privileges.</Text>

              <FlatList
                data={Object.values(memberProfiles).filter(m => m.id !== user?.uid)}
                keyExtractor={(item) => item.id}
                renderItem={renderMemberItem}
                style={{ width: '100%', marginBottom: 15 }}
                showsVerticalScrollIndicator={false}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setIsManageMemberVisible(false)}>
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", paddingHorizontal: 20 },
  header: { marginTop: 40, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#333" },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  avatarContainer: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: "#E3F2FD",
    justifyContent: "center", alignItems: "center",
  },
  avatarText: { fontSize: 28, fontWeight: "bold", color: "#2196F3" },
  editAvatarBadge: {
    position: 'absolute', bottom: 0, right: -4,
    backgroundColor: '#63B995', width: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff'
  },
  
  nameText: { fontSize: 20, fontWeight: "bold", color: "#333" },
  emailText: { fontSize: 14, color: "#666", marginTop: 2 },
  roleText: { fontSize: 12, color: "#999", marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },

  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 15 },
  houseCard: { backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: "#e0e0e0" },
  houseHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  houseName: { fontSize: 20, fontWeight: "bold", color: "#333", marginLeft: 10 },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 15 },
  codeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  codeLabel: { fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 1 },
  codeValue: { fontSize: 24, fontWeight: "bold", color: "#333", marginTop: 4, letterSpacing: 2 },
  shareButton: { padding: 10, backgroundColor: "#f5f5f5", borderRadius: 8 },

  manageButton: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  manageButtonText: { color: '#fff', fontWeight: 'bold' },

  joinButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#fff", padding: 15, borderRadius: 12, marginBottom: 25, borderWidth: 1, borderColor: "#63B995", borderStyle: "dashed" },
  joinButtonText: { color: "#63B995", fontWeight: "600", marginLeft: 8 },

  switchButton: { backgroundColor: "#fff", padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#eee" },
  activeSwitchButton: { borderColor: "#63B995", backgroundColor: "#F3E5F5" },
  switchText: { color: "#666", fontWeight: "500" },
  activeSwitchText: { color: "#63B995", fontWeight: "bold" },

  logoutButton: { backgroundColor: "#ffebee", padding: 15, borderRadius: 12, alignItems: "center", marginTop: 10 },
  logoutText: { color: "#d32f2f", fontWeight: "bold", fontSize: 16 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", width: "90%", padding: 25, borderRadius: 20, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  modalSubtitle: { fontSize: 14, color: "#666", marginBottom: 20, textAlign: "center" },
  input: { backgroundColor: "#f0f0f0", padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  
  // Char count style
  charCount: {
    textAlign: 'right',
    color: '#888',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 20,
    marginRight: 5
  },

  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  button: { flex: 1, padding: 15, borderRadius: 10, alignItems: "center", marginHorizontal: 5 },
  cancelButton: { backgroundColor: "#ccc" },
  saveButton: { backgroundColor: "#63B995" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  avatarOption: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center', alignItems: 'center',
    margin: 5
  },

  // Member Management Styles
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  memberAvatar: { fontSize: 24 },
  memberName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  memberEmail: { fontSize: 12, color: '#999' },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  roleBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden'
  },
  adminBadge: { backgroundColor: '#333', color: '#fff' },
  memberBadge: { backgroundColor: '#e0e0e0', color: '#666' },
  roleButton: { padding: 5 }
});