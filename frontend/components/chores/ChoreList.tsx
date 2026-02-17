import React from "react";
import { Text, FlatList, ActivityIndicator } from "react-native";
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
    return (
      <ActivityIndicator 
        size="large" 
        color="#63B995" 
        className="mt-[50px]" 
      />
    );
  }

  return(
    <FlatList
      data={chores}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        <Text className="text-center text-dim dark:text-gray-400 mt-5">
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