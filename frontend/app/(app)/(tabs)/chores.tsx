import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useHousehold } from "@/context/HouseholdContext";
import { useChores } from "@/context/ChoreContext";
import { choreService } from "@/services/choreService";

export default function ChoresScreen() {
  const { user } = useAuth();
  const { activeHousehold, memberProfiles } = useHousehold();
  const { chores, addChore, loading, resetAll, resetChore } = useChores();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newChoreTitle, setNewChoreTitle] = useState("");
  const [newChorePoints, setNewChorePoints] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Define Admin Permission
  const isAdmin = activeHousehold?.members?.[user?.uid || ""] == "admin";

  const handleAddChore = async () => {
    if (!newChoreTitle || !newChorePoints) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setIsAdding(true);
      await addChore(newChoreTitle, parseInt(newChorePoints));

      setNewChoreTitle("");
      setNewChorePoints("");
      setIsModalVisible(false);
    } catch (error) {
      Alert.alert("Error", "Failed to add chore");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteChore = (id: string) => {
    if (!isAdmin) {
      Alert.alert("Permission Denied", "Only the household admin can delete chores.");
      return;
    }

    Alert.alert("Delete Chore", "Are you sure you want to remove this chore?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => await choreService.deleteChore(id),
      },
    ]);
  };

  // Handle Delete All
  const handleDeleteAll = () => {
    if (!isAdmin || chores.length === 0) return;

    Alert.alert(
      "Delete ALL Chores",
      "WARNING: This will remove every single task from the list. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              // Delete all chores in parallel
              const promises = chores.map((chore) => choreService.deleteChore(chore.id));
              await Promise.all(promises);
            } catch (error) {
              Alert.alert("Error", "Failed to delete all chores.");
            }
          },
        },
      ]
    );
  };

  // Handler for Reset All
  const handleResetAll = () => {
    Alert.alert("Reset All", "Make all chores 'Pending' again? Points earned will remain.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", onPress: resetAll }
    ]);
  };

  // Handler for individual reset
  const handleResetSingle = (id: string) => {
    Alert.alert("Reset Chore", "Make this chore available again?", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", onPress : async () => await resetChore(id) }
    ]);
  };

  const Avatar = ({ name, avatar, color }: { name?: string | null; avatar?: string | null; color: string }) => {
    if (avatar) {
      return (
        <View style={[styles.avatarContainer, { backgroundColor: 'transparent' }]}>
          <Text style={{ fontSize: 14 }}>{avatar}</Text>
        </View>
      );
    }
    
    const initial = name ? name.charAt(0).toUpperCase() : "?";
    return (
      <View style={[styles.avatarContainer, { backgroundColor: color }]}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
    );
  };

  // Helper to render the badges
  const renderStatusBadge = (item: any) => {
    const isMe = item.inProgressBy === user?.uid || item.completedBy === user?.uid;

    //  Get Live Profile Data
    const getLiveProfile = (userId: string, snapshotName: string, snapshotAvatar: string) => {
      // 1. Try to find the user in the live memberProfiles list
      const liveUser = memberProfiles[userId];
      
      // 2. Return live data if exists, otherwise fallback to snapshot
      return {
        name: liveUser?.displayName || snapshotName || "Unknown",
        avatar: liveUser?.photoURL || snapshotAvatar || null
      };
    };

    if (item.inProgress && !isMe) {
      // Fetch live profile for the person working
      const worker = getLiveProfile(item.inProgressBy, item.inProgressByName, item.inProgressByAvatar);

      return (
        <View style={[styles.badge, { backgroundColor: "#FFF3E0", borderColor: "#FFB74D" }]}>
          <Avatar name={worker.name} avatar={worker.avatar} color="#F57C00" />
          <Text style={[styles.badgeText, { color: "#E65100" }]}>
            {worker.name} is working
          </Text>
        </View>
      );
    }

    if (item.inProgress && isMe) {
      return (
        <View style={[styles.badge, { backgroundColor: "#E3F2FD", borderColor: "#64B5F6" }]}>
          <Text style={{fontSize: 14, marginRight: 4}}>{user?.photoURL || "👤"}</Text>
          <Text style={[styles.badgeText, { color: "#1565C0" }]}>Doing Now</Text>
        </View>
      );
    }

    if (item.completed && !isMe) {
      // Fetch live profile for the completer
      const completer = getLiveProfile(item.completedBy, item.completedByName, item.completedByAvatar);

      return (
        <View style={[styles.badge, { backgroundColor: "#E8F5E9", borderColor: "#81C784" }]}>
          <Avatar name={completer.name} avatar={completer.avatar} color="#388E3C" />
          <Text style={[styles.badgeText, { color: "#2E7D32" }]}>
            Done by {completer.name}
          </Text>
        </View>
      );
    }

    if (item.completed && isMe) {
      // Fetch live profile
      const completer = getLiveProfile(user?.uid || "", item.completedByName, item.completedByAvatar);

      return (
        <View style={[styles.badge, { backgroundColor: "#F3E5F5", borderColor: "#BA68C8" }]}>
          <Text style={{fontSize: 16, marginRight: 4}}>{completer.avatar || "✅"}</Text>
          <Text style={[styles.badgeText, { color: "#7B1FA2" }]}>Done by You</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Chores</Text>

        {/* Only show actions if Admin */}
        {isAdmin && (
          <View style={styles.headerActions}>
            
            {chores.length > 0 && (
              <>
                {/* Reset All Button */}
                <TouchableOpacity
                  style={styles.resetAllButton}
                  onPress={handleResetAll}
                >
                  <Ionicons name="refresh" size={22} color="white" />
                </TouchableOpacity>

                {/* Delete All Button */}
                <TouchableOpacity
                  style={styles.deleteAllButton}
                  onPress={handleDeleteAll}
                >
                  <Ionicons name="trash-bin-outline" size={22} color="white" />
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsModalVisible(true)}
            >
              <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#6200ee"
          style={{ marginTop: 50 }}
        />
      ) : (
        // Chores List
        <FlatList
          data={chores}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: "#888", marginTop: 20 }}>
              No chores yet.
              {isAdmin ? "Add one!" : "Ask your admin to add some."}
            </Text>
          }
          renderItem={({ item }) => (
            <View style={[styles.listCard, item.completed && { opacity: 0.8 }]}>
              <View style={styles.cardLeftContent}>
                <Text
                  style={[
                    styles.choreTitle,
                    item.completed && {
                      textDecorationLine: "line-through",
                      color: "#999",
                    },
                  ]}
                >
                  {item.title}
                </Text>

                {renderStatusBadge(item)}
              </View>

              <View style={styles.rightActions}>
                <Text style={styles.pointsText}>{item.points} pts</Text>

                {isAdmin && (
                  <View style={styles.adminRow}>
                     {/* Individual Reset Button */}
                    <TouchableOpacity onPress={() => handleResetSingle(item.id)}>
                      <Ionicons name="refresh-circle-outline" size={26} color="#2196F3" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleDeleteChore(item.id)}>
                      <Ionicons name="trash-outline" size={22} color="#FF5252" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}
        />
      )}

      {/* ADD CHORE MODAL */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Chore</Text>

            <TextInput
              style={styles.input}
              placeholder="Chore Name (e.g. Fold Laundry)"
              value={newChoreTitle}
              onChangeText={setNewChoreTitle}
            />

            <TextInput
              style={styles.input}
              placeholder="Points (e.g. 50)"
              value={newChorePoints}
              onChangeText={setNewChorePoints}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleAddChore}
                disabled={isAdding}
              >
                {isAdding ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Add Task</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  // container for buttons on the right
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  title: { fontSize: 28, fontWeight: "bold", color: "#333" },
  addButton: {
    backgroundColor: "#6200ee",
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
  // Delete All Button Style
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
  // Reset All Button Style
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
    textAlign: "left"
  },
  rightActions: { flexDirection: "row", alignItems: "center" },
  adminRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  pointsText: { marginRight: 15, fontWeight: "bold", color: "#6200ee" },

  // Badge & Avatar Styles
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
  avatarText: {
    color: "white",
    fontSize: 9,
    fontWeight: "bold",
  },

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