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
  const { activeHousehold } = useHousehold(); // get household details
  const { chores, addChore, loading } = useChores(); // get chores

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newChoreTitle, setNewChoreTitle] = useState("");
  const [newChorePoints, setNewChorePoints] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Define Asmin Permission
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
      Alert.alert(
        "Permission Denied",
        "Only the household admin can delete chores.",
      );
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Chores</Text>

        {/* Only show if Admin */}
        {isAdmin && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsModalVisible(true)}
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#6200ee"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={chores}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: "#888", marginTop: 20 }}>
              No chores yet.{" "}
              {isAdmin ? "Add one!" : "Ask your admin to add some."}
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.listCard}>
              <View>
                <Text style={styles.choreTitle}>{item.title}</Text>
                <Text style={styles.categoryBadge}>General</Text>
              </View>

              <View style={styles.rightActions}>
                <Text style={styles.pointsText}>{item.points} pts</Text>

                {/* Only show trash can if Admin */}
                {isAdmin && (
                  <TouchableOpacity onPress={() => handleDeleteChore(item.id)}>
                    <Ionicons name="trash-outline" size={20} color="#FF5252" />
                  </TouchableOpacity>
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
  listCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  choreTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  categoryBadge: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  rightActions: { flexDirection: "row", alignItems: "center" },
  pointsText: { marginRight: 15, fontWeight: "bold", color: "#6200ee" },

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
