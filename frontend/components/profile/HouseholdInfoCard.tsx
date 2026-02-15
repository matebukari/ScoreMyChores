import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface HouseholdInfoCardProps {
  household: any;
  loading: boolean;
  isAdmin: boolean;
  userPoints: number;
  onShareCode: () => void;
  onManageMembers: () => void;
  onLeave: () => void;
  onDelete: () => void;
  leaving: boolean;
  deleting: boolean;
}

export default function HouseholdInfoCard({
  household,
  loading,
  isAdmin,
  userPoints,
  onShareCode,
  onManageMembers,
  onLeave,
  onDelete,
  leaving,
  deleting,
}: HouseholdInfoCardProps) {
  if (loading) return <ActivityIndicator size="large" color="#63B995" />;
  if (!household)
    return (
      <Text style={{ color: "#888", marginBottom: 20 }}>
        No active household.
      </Text>
    );

  return (
    <View style={styles.houseCard}>
      <View style={styles.houseHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="home" size={24} color="#63B995" />
          <Text style={styles.houseName}>{household.name}</Text>
        </View>

        <View style={styles.pointsBadge}>
          <Ionicons name="trophy" size={14} color="#F59E0B" />
          <Text style={styles.pointsText}>{userPoints} pts</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.codeRow}>
        <View>
          <Text style={styles.codeLabel}>Invite Code</Text>
          <Text style={styles.codeValue}>{household.inviteCode}</Text>
        </View>
        <TouchableOpacity onPress={onShareCode} style={styles.shareButton}>
          <Ionicons name="share-outline" size={20} color="#63B995" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {isAdmin ? (
        <View style={styles.adminActions}>
          <TouchableOpacity
            style={styles.manageButton}
            onPress={onManageMembers}
          >
            <Ionicons name="people-outline" size={20} color="#fff" />
            <Text style={styles.manageButtonText}>Members</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.manageButton, styles.deleteButton]}
            onPress={onDelete}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="trash-outline" size={20} color="#fff" />
            )}
            <Text style={styles.manageButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.manageButton, styles.leaveButton]}
          onPress={onLeave}
          disabled={leaving}
        >
          {leaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="log-out-outline" size={20} color="#fff" />
          )}
          <Text style={styles.manageButtonText}>Leave Household</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  houseCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  houseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  houseName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FEF3C7'
  },
  pointsText: {
    color: '#B45309',
    fontWeight: 'bold',
    fontSize: 14
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

  adminActions: { flexDirection: "row", gap: 10 },
  manageButton: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flex: 1,
  },
  deleteButton: { backgroundColor: "#ef5350" },
  leaveButton: { backgroundColor: "#ef5350", width: "100%" },
  manageButtonText: { color: "#fff", fontWeight: "bold" },
});
