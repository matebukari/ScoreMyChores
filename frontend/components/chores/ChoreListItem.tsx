import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import UserAvatar from "@/components/ui/UserAvatar";
import { useChoreListItem } from "@/hooks/useChoreListItem";

interface ChoreListItemProps {
  item: any;
  currentUserId?: string;
  memberProfiles: Record<string, any>;
  isAdmin: boolean;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ChoreListItem({
  item,
  currentUserId,
  memberProfiles,
  isAdmin,
  onReset,
  onDelete,
}: ChoreListItemProps) {

  const { futureDate, getLiveProfile} = useChoreListItem(item, memberProfiles);

  // --- NEW: Helper to format date nicely ---
  const getScheduledText = (date: Date) => {
    const now = new Date();
    const isToday = date.getDate() === now.getDate() &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear();
    
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) return `Today, ${timeStr}`;
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.getDate() === tomorrow.getDate() &&
                       date.getMonth() === tomorrow.getMonth() &&
                       date.getFullYear() === tomorrow.getFullYear();

    if (isTomorrow) return `Tomorrow, ${timeStr}`;

    // Default: "Feb 15, 10:00 AM"
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
  };

  const renderStatusBadge = () => {
    const isMe = item.inProgressBy === currentUserId || item.completedBy === currentUserId;

    if (item.inProgress && !isMe) {
      const worker = getLiveProfile(item.inProgressBy, item.inProgressByName, item.inProgressByAvatar);
      return (
        <View style={[styles.badge, { backgroundColor: "#FFF3E0", borderColor: "#FFB74D" }]}>
          <UserAvatar name={worker.name} avatar={worker.avatar} color="#F57C00" size={22} fontSize={10} />
          <Text style={[styles.badgeText, { color: "#E65100" }]}>{worker.name} is working</Text>
        </View>
      );
    }
    if (item.inProgress && isMe) {
      const worker = getLiveProfile(item.inProgressBy, item.inProgressByName, item.inProgressByAvatar);
      return (
        <View style={[styles.badge, { backgroundColor: "#E3F2FD", borderColor: "#64B5F6" }]}>
          <UserAvatar name={worker.name} avatar={worker.avatar} color="#1565C0" size={22} fontSize={10} />
          <Text style={[styles.badgeText, { color: "#1565C0" }]}>Doing Now</Text>
        </View>
      );
    }
    if (item.completed && !isMe) {
      const completer = getLiveProfile(item.completedBy, item.completedByName, item.completedByAvatar);
      return (
        <View style={[styles.badge, { backgroundColor: "#E8F5E9", borderColor: "#81C784" }]}>
          <UserAvatar name={completer.name} avatar={completer.avatar} color="#388E3C" size={22} fontSize={10} />
          <Text style={[styles.badgeText, { color: "#2E7D32" }]}>Done by {completer.name}</Text>
        </View>
      );
    }
    if (item.completed && isMe) {
      const completer = getLiveProfile(currentUserId || "", item.completedByName, item.completedByAvatar);
      return (
        <View style={[styles.badge, { backgroundColor: "#F3E5F5", borderColor: "#BA68C8" }]}>
          <UserAvatar name={completer.name} avatar={completer.avatar} color="#7B1FA2" size={22} fontSize={10} />
          <Text style={[styles.badgeText, { color: "#7B1FA2" }]}>Done by You</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={[
      styles.listCard, 
      (item.completed || futureDate) && { opacity: 0.8 },
      futureDate && { backgroundColor: "#f9f9f9", borderColor: "#eee" }
      ]}
    >
      <View style={styles.cardLeftContent}>
        <Text
          style={[
            styles.choreTitle,
            item.completed && { textDecorationLine: "line-through", color: "#999" },
            futureDate && { color: "#888" }
          ]}
        >
          {item.title}
        </Text>

        {futureDate ? (
          <View style={styles.futureBadge}>
            <Ionicons name="time-outline" size={14} color="#888" />
            <Text style={styles.futureText}>
              Available at {getScheduledText(futureDate)}
            </Text>
          </View>
        ) : (
          renderStatusBadge()
        )}
      </View>
      
      <View style={styles.rightActions}>
        <Text style={styles.pointsText}>{item.points} pts</Text>
        {isAdmin && (
          <View style={styles.adminRow}>
            <TouchableOpacity onPress={() => onReset(item.id)}>
              <Ionicons name="refresh-circle-outline" size={26} color="#2196F3" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(item.id)}>
              <Ionicons name="trash-outline" size={22} color="#FF5252" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  futureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2
  },
  futureText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic'
  }
});