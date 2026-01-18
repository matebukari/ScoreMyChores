import React, { useState } from "react";
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
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useHousehold } from "@/context/HouseholdContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { householdService } from "@/services/householdService";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { activeHousehold, joinedHouseholds, switchHousehold, loading } =
    useHousehold();

  const [switching, setSwitching] = useState(false);

  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [joining, setJoining] = useState(false);

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/signin");
        },
      },
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
      Alert.alert("Success", "Switched household!");
    } catch (error) {
      Alert.alert("Error", "Failed to switch.");
    } finally {
      setSwitching(false);
    }
  };

  // Handle Joining a House
  const handleJoinHousehold = async () => {
    if (!inviteCode || !user) return;
    try {
      setJoining(true);
      await householdService.joinHousehold(
        user.uid,
        inviteCode.trim().toUpperCase(),
      );

      setIsJoinModalVisible(false);
      setInviteCode("");
      Alert.alert("Success", "You have joined the household!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Invalid invite code");
    } finally {
      setJoining(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* USER INFO */}
      <View style={styles.card}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </Text>
        </View>
        <View>
          <Text style={styles.emailText}>{user?.email}</Text>
          <Text style={styles.roleText}>
            Role:{" "}
            {activeHousehold?.members[user?.uid || ""] === "admin"
              ? "Admin"
              : "Member"}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Current Household</Text>

      {/* HOUSEHOLD INFO */}
      {loading || switching ? (
        <ActivityIndicator size="large" color="#6200ee" />
      ) : activeHousehold ? (
        <View style={styles.houseCard}>
          <View style={styles.houseHeader}>
            <Ionicons name="home" size={24} color="#6200ee" />
            <Text style={styles.houseName}>{activeHousehold.name}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.codeRow}>
            <View>
              <Text style={styles.codeLabel}>Invite Code</Text>
              <Text style={styles.codeValue}>{activeHousehold.inviteCode}</Text>
            </View>
            <TouchableOpacity
              onPress={handleShareCode}
              style={styles.shareButton}
            >
              <Ionicons name="share-outline" size={20} color="#6200ee" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text style={{ color: "#888", marginBottom: 20 }}>
          No active household.
        </Text>
      )}

      {/* JOIN ANOTHER HOUSEHOLD BUTTON */}
      <TouchableOpacity
        style={styles.joinButton}
        onPress={() => setIsJoinModalVisible(true)}
      >
        <Ionicons name="add-circle-outline" size={22} color="#6200ee" />
        <Text style={styles.joinButtonText}>Join Another Household</Text>
      </TouchableOpacity>

      {/* SWITCH HOUSEHOLDS LIST */}
      {joinedHouseholds.length > 1 && (
        <>
          <Text style={styles.sectionTitle}>Switch Household</Text>
          {joinedHouseholds.map((houseId) => (
            <TouchableOpacity
              key={houseId}
              style={[
                styles.switchButton,
                houseId === activeHousehold?.id && styles.activeSwitchButton,
              ]}
              onPress={() => handleSwitch(houseId)}
            >
              <Text
                style={[
                  styles.switchText,
                  houseId === activeHousehold?.id && styles.activeSwitchText,
                ]}
              >
                {houseId === activeHousehold?.id
                  ? "Current House"
                  : `House ID: ${houseId.substring(0, 5)}...`}
              </Text>
              {houseId === activeHousehold?.id && (
                <Ionicons name="checkmark-circle" size={20} color="#6200ee" />
              )}
            </TouchableOpacity>
          ))}
        </>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 50 }} />

      {/* JOIN MODAL */}
      <Modal
        visible={isJoinModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsJoinModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Join Household</Text>
            <Text style={styles.modalSubtitle}>
              Enter the invite code from the Admin
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Invite Code (e.g. A1B2C3)"
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="characters"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsJoinModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleJoinHousehold}
                disabled={joining}
              >
                {joining ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Join</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 20 },
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: { fontSize: 24, fontWeight: "bold", color: "#2196F3" },
  emailText: { fontSize: 16, fontWeight: "600", color: "#333" },
  roleText: { fontSize: 14, color: "#666", marginTop: 2 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },

  houseCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  houseHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  houseName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 15 },
  codeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  codeLabel: {
    fontSize: 12,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  codeValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 4,
    letterSpacing: 2,
  },
  shareButton: { padding: 10, backgroundColor: "#f5f5f5", borderRadius: 8 },

  // New Join Button Style
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#6200ee",
    borderStyle: "dashed",
  },
  joinButtonText: { color: "#6200ee", fontWeight: "600", marginLeft: 8 },

  switchButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  activeSwitchButton: { borderColor: "#6200ee", backgroundColor: "#F3E5F5" },
  switchText: { color: "#666", fontWeight: "500" },
  activeSwitchText: { color: "#6200ee", fontWeight: "bold" },

  logoutButton: {
    backgroundColor: "#ffebee",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  logoutText: { color: "#d32f2f", fontWeight: "bold", fontSize: 16 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    padding: 25,
    borderRadius: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: { backgroundColor: "#ccc" },
  saveButton: { backgroundColor: "#6200ee" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
