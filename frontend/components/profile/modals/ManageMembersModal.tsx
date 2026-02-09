import React from "react";
import { Modal, View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import UserAvatar from "@/components/ui/UserAvatar";

interface MemberItem {
  id: string;
  displayName?: string | null;
  photoURL?: string | null;
  email?: string | null;
}

interface ManageMembersModalProps {
  visible: boolean;
  onClose: () => void;
  members: MemberItem[];
  householdMembersMap?: Record<string, "admin" | "member" | string> | null;
  currentUserId?: string | null;
  onUpdateRole: (targetUserId: string, currentRole: 'admin' | 'member') => void;
  updatingRole: string | null;
}

export default function ManageMembersModal({ visible, onClose, members, householdMembersMap, currentUserId, onUpdateRole, updatingRole }: ManageMembersModalProps) {
  
  const renderMemberItem = ({ item }: { item: MemberItem }) => {
    const roleRaw = householdMembersMap?.[item.id] || 'member';
    const role = roleRaw === 'admin' ? 'admin' : 'member';
    
    const isMe = item.id === currentUserId;

    return (
      <View style={styles.memberRow}>
        <View style={styles.memberInfo}>
          <UserAvatar name={item.displayName} avatar={item.photoURL} size={32} fontSize={14} />
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
              onPress={() => onUpdateRole(item.id, role)}
              disabled={!!updatingRole}
              style={styles.roleButton}
            >
              {updatingRole === item.id ? (
                <ActivityIndicator size="small" color="#63B995"/>
              ) : (
                <Ionicons
                  name={role === 'admin' ? "arrow-down-circle-outline" : "arrow-up-circle-outline"}
                  size={24} color="#63B995"
                />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '70%' }]}>
          <Text style={styles.modalTitle}>Manage Members</Text>
          <Text style={styles.modalSubtitle}>Promote members to admin or remove privileges.</Text>
          <FlatList
            data={members}
            keyExtractor={(item) => item.id}
            renderItem={renderMemberItem}
            style={{ width: '100%', marginBottom: 15 }}
            showsVerticalScrollIndicator={false}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", width: "90%", padding: 25, borderRadius: 20, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  modalSubtitle: { fontSize: 14, color: "#666", marginBottom: 20, textAlign: "center" },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  button: { flex: 1, padding: 15, borderRadius: 10, alignItems: "center", marginHorizontal: 5 },
  cancelButton: { backgroundColor: "#ccc" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  memberRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  memberInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  memberName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  memberEmail: { fontSize: 12, color: '#999' },
  roleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roleBadge: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
  adminBadge: { backgroundColor: '#333', color: '#fff' },
  memberBadge: { backgroundColor: '#e0e0e0', color: '#666' },
  roleButton: { padding: 5 }
});