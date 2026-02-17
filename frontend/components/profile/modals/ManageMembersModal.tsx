import React from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
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
  onUpdateRole: (
    targetUserId: string,
    currentRole: "admin" | "member"
  ) => void;
  updatingRole: string | null;
  onRemoveMember: (targetUserId: string, memberName: string) => void;
  removingMember: string | null;
}

export default function ManageMembersModal({
  visible,
  onClose,
  members,
  householdMembersMap,
  currentUserId,
  onUpdateRole,
  updatingRole,
  onRemoveMember,
  removingMember,
}: ManageMembersModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const renderMemberItem = ({ item, index }: { item: MemberItem; index: number }) => {
    const roleRaw = householdMembersMap?.[item.id] || "member";
    const role = roleRaw === "admin" ? "admin" : "member";

    const isMe = item.id === currentUserId;
    const name = item.displayName || "Unknown";

    // Fallback key generation if id is missing
    const uniqueKey = item.id || `member-${index}`;

    return (
      <View
        key={uniqueKey}
        /* UPDATED: dark:border-gray-500 for better visibility */
        className="flex-row justify-between items-center py-3 border-b border-gray-100 dark:border-gray-500"
      >
        {/* Left: Avatar & Info */}
        <View className="flex-row items-center flex-1 gap-3 pr-2">
          <UserAvatar
            name={item.displayName}
            avatar={item.photoURL}
            size={36}
            fontSize={14}
          />
          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="text-base font-bold text-text-main dark:text-text-inverted"
            >
              {name}
            </Text>
            <Text
              numberOfLines={1}
              className="text-xs text-text-muted dark:text-gray-400"
            >
              {item.email || "No email"}
            </Text>
          </View>
        </View>

        {/* Right: Actions */}
        <View className="flex-row items-center gap-2">
          {/* Role Badge / Toggle */}
          <View className="flex-row items-center gap-1">
            <View
              className={`
                px-2 py-1 rounded
                ${role === "admin" 
                  ? "bg-gray-800 dark:bg-gray-700" 
                  : "bg-gray-200 dark:bg-gray-600"
                }
              `}
            >
              <Text
                className={`
                  text-[10px] font-bold uppercase
                  ${role === "admin" 
                    ? "text-white" 
                    : "text-gray-600 dark:text-gray-300"
                  }
                `}
              >
                {role === "admin" ? "Admin" : "Member"}
              </Text>
            </View>

            {!isMe && (
              <TouchableOpacity
                onPress={() => onUpdateRole(item.id, role)}
                disabled={!!updatingRole || !!removingMember}
                className="p-1"
              >
                {updatingRole === item.id ? (
                  <ActivityIndicator size="small" color="#63B995" />
                ) : (
                  <Ionicons
                    name={
                      role === "admin"
                        ? "arrow-down-circle-outline"
                        : "arrow-up-circle-outline"
                    }
                    size={24}
                    color="#63B995"
                  />
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Kick Button */}
          {!isMe && (
            <TouchableOpacity
              className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg ml-1"
              onPress={() => onRemoveMember(item.id, name)}
              disabled={!!removingMember || !!updatingRole}
            >
              {removingMember === item.id ? (
                <ActivityIndicator size="small" color="#ef5350" />
              ) : (
                <Ionicons 
                  name="trash-outline" 
                  size={20} 
                  color={isDark ? "#EF4444" : "#ef5350"} 
                />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white dark:bg-card-dark w-full max-w-[340px] max-h-[70%] rounded-2xl p-6 shadow-xl">
          <Text className="text-xl font-bold mb-1 text-center text-text-main dark:text-text-inverted">
            Manage Members
          </Text>
          <Text className="text-sm text-text-muted dark:text-gray-400 mb-5 text-center">
            Promote members to admin or remove privileges.
          </Text>

          <FlatList
            data={members}
            keyExtractor={(item, index) => item.id || `member-${index}`}
            renderItem={renderMemberItem}
            className="w-full mb-4"
            showsVerticalScrollIndicator={false}
          />

          <TouchableOpacity
            className="bg-gray-300 dark:bg-gray-600 p-3.5 rounded-xl items-center w-full"
            onPress={onClose}
          >
            <Text className="text-white font-bold text-base">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}