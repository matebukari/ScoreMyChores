import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AddChoreModal from "@/components/chores/AddChoreModal";
import ChoreList from "@/components/chores/ChoreList";

import { useChoresScreen } from "@/hooks/useChoresScreen";

export default function ChoresScreen() {
  const {
    chores,
    loading,
    memberProfiles,
    currentUserId,
    isAdmin,
    isModalVisible,
    setIsModalVisible,
    handleAddChoreSubmit,
    handleDeleteChore,
    handleDeleteAll,
    handleResetAll,
    handleResetSingle,
  } = useChoresScreen();

  const insets = useSafeAreaInsets();
  const safeTop =
    insets.top > 0 ? insets.top : Platform.OS === "android" ? 30 : 0;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: safeTop,
          paddingLeft: insets.left + 20,
          paddingRight: insets.right + 20,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Manage Chores</Text>
        {isAdmin && (
          <View style={styles.headerActions}>
            {chores.length > 0 && (
              <>
                <TouchableOpacity
                  style={styles.resetAllButton}
                  onPress={handleResetAll}
                >
                  <Ionicons name="refresh" size={22} color="white" />
                </TouchableOpacity>
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

      <ChoreList
        chores={chores}
        loading={loading}
        isAdmin={isAdmin}
        currentUserId={currentUserId}
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
