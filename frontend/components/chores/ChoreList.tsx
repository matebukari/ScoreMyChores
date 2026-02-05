import React from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import ChoreListItem from "./ChoreListItem";

interface ChoreListProps {
  chores: any[];
  loading: boolean;
  isAdmin: boolean;
  currentUserId?: string;
  memberProfiles: Record<string, any>;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ChoreList({
  chores,
  loading,
  isAdmin,
  currentUserId,
  memberProfiles,
  onReset,
  onDelete,
}: ChoreListProps) {

  if (loading) {
    return <ActivityIndicator size="large" color="#63B995" style={{ marginTop: 50 }} />;
  }

  return(
    <FlatList
      data={chores}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        <Text style={styles.emptyText}>
          No chores yet. {isAdmin ? "Add one!" : "Ask your admin to add some."}
        </Text>
      }
      renderItem={({ item }) => (
        <ChoreListItem
          item={item}
          currentUserId={currentUserId}
          memberProfiles={memberProfiles}
          isAdmin={isAdmin}
          onReset={onReset}
          onDelete={onDelete}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
  },
});