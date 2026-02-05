import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useHousehold } from "@/context/HouseholdContext";
import { useChores } from "@/context/ChoreContext";
import { choreService } from "@/services/choreService";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Components
import AddChoreModal from "@/components/chores/AddChoreModal";
import ChoreList from "@/components/chores/ChoreList";

export default function ChoresScreen() {
  const { user } = useAuth();
  const { activeHousehold, memberProfiles } = useHousehold();
  const { chores, addChore, loading, resetAll, resetChore } = useChores();

  const [isModalVisible, setIsModalVisible] = useState(false);

  const insets = useSafeAreaInsets();
  const safeTop = insets.top > 0 ? insets.top : (Platform.OS === 'android' ? 30 : 0);
  const isAdmin = activeHousehold?.members?.[user?.uid || ""] === "admin";

  const handleAddChoreSubmit = async (title: string, points: number, scheduledFor: Date | null) => {
    await addChore(title, points, scheduledFor);
  };

  const handleDeleteChore = (id: string) => {
    if (!isAdmin) {
      Alert.alert("Permission Denied", "Only the household admin can delete chores.");
      return;
    }
    Alert.alert("Delete Chore", "Are you sure you want to remove this chore?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => await choreService.deleteChore(id) },
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
          } catch (error) {
            Alert.alert("Error", "Failed to delete all chores.");
          }
        },
      },
    ]);
  };

  const handleResetAll = () => {
    Alert.alert("Reset All", "Make all chores 'Pending' again?", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", onPress: resetAll },
    ]);
  };

  const handleResetSingle = (id: string) => {
    Alert.alert("Reset Chore", "Make this chore available again?", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", onPress: async () => await resetChore(id) },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: safeTop, paddingLeft: insets.left + 20, paddingRight: insets.right + 20 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Chores</Text>
        {isAdmin && (
          <View style={styles.headerActions}>
            {chores.length > 0 && (
              <>
                <TouchableOpacity style={styles.resetAllButton} onPress={handleResetAll}>
                  <Ionicons name="refresh" size={22} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteAllButton} onPress={handleDeleteAll}>
                  <Ionicons name="trash-bin-outline" size={22} color="white" />
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
              <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ChoreList
        chores={chores}
        loading={loading}
        isAdmin={isAdmin}
        currentUserId={user?.uid}
        memberProfiles={memberProfiles}
        onReset={handleResetSingle}
        onDelete={handleDeleteChore}
      />

      {/* ADD CHORE MODAL */}
      <AddChoreModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onAdd={handleAddChoreSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  headerActions: { flexDirection: "row", gap: 12 },
  title: { fontSize: 28, fontWeight: "bold", color: "#333" },
  addButton: {
    backgroundColor: "#63B995",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  deleteAllButton: {
    backgroundColor: "#FF5252",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  resetAllButton: {
    backgroundColor: "#2196F3",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  listCard: {
    backgroundColor: "#fff",
    padding: 8,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
    minHeight: 70,
  },
  cardLeftContent: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 4,
  },
  choreTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "left",
  },
  rightActions: { flexDirection: "row", alignItems: "center" },
  adminRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  pointsText: { marginRight: 15, fontWeight: "bold", color: "#63B995" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    alignSelf: "flex-start",
    borderWidth: 1,
    gap: 6,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
  avatarContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "white", fontSize: 9, fontWeight: "bold" },
});