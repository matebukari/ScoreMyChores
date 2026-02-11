import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import UserAvatar from "@/components/ui/UserAvatar";
import { User } from "firebase/auth";

interface UserInfoCardProps {
  user: User | null;
  avatar?: string | null;
  role: "admin" | "member";
  onEditName: () => void;
  onEditAvatar: () => void;
}

export default function UserInfoCard({ user, avatar, role, onEditName, onEditAvatar }: UserInfoCardProps) {
  const displayName = user?.displayName || "User";
  const currentAvatar = avatar !== undefined ? avatar : user?.photoURL;

  return (
    <View style={styles.card}>
      <View style={{ position: "relative" }}>
        <UserAvatar
          name={displayName}
          avatar={currentAvatar}
          size={60}
          fontSize={28}
          color="#2196F3"
        />
        <TouchableOpacity style={styles.editAvatarBadge} onPress={onEditAvatar}>
           <Ionicons name="camera" size={14} color="white" />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, marginLeft: 15 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={styles.nameText}>{displayName}</Text>
          <TouchableOpacity onPress={onEditName}>
            <Ionicons name="pencil-sharp" size={16} color="#63B995" />
          </TouchableOpacity>
        </View>

        <Text style={styles.emailText}>{user?.email}</Text>
        <Text style={styles.roleText}>Role: {role === "admin" ? "Admin" : "Member"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  editAvatarBadge: {
    position: "absolute",
    bottom: 0,
    right: -4,
    backgroundColor: "#63B995",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  nameText: { fontSize: 20, fontWeight: "bold", color: "#333" },
  emailText: { fontSize: 14, color: "#666", marginTop: 2 },
  roleText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});