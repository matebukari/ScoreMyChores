import React from "react";
import { View, Text, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import UserAvatar from "@/components/ui/UserAvatar";

interface RankUser {
  id: string;
  name: string;
  score: number;
  avatar?: string;
}

interface RankListProps {
  data: RankUser[];
  currentUserId?: string;
}

export default function RankList({ data, currentUserId }: RankListProps) {
  const getRankIcon = (index: number) => {
    // Rank 1: Gold
    if (index === 0) {
      return <Ionicons name="medal" size={24} color="#FFD700" />;
    }
    // Rank 2: Silver
    if (index === 1) {
      return <Ionicons name="medal" size={24} color="#C0C0C0" />;
    }
    // Rank 3: Bronze
    if (index === 2) {
      return <Ionicons name="medal" size={24} color="#CD7F32" />;
    }
    return (
      <Text className="text-base font-bold text-gray-500 dark:text-gray-400">
        {index + 1}
      </Text>
    );
  };

  return (
    <View className="flex-1 bg-white dark:bg-card-dark rounded-t-[30px] shadow-xl overflow-hidden mt-5">
      <FlatList
        data={data}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 10 }}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text className="text-center text-gray-400 mt-5 text-sm">
            {data.length === 0 ? "No members ranked yet." : ""}
          </Text>
        }
        renderItem={({ item, index }) => (
          <View
            className={`
              flex-row items-center py-4 px-4 border-b border-gray-100 dark:border-gray-800
              ${item.id === currentUserId ? "bg-green-50 dark:bg-green-900/20" : ""}
            `}
          >
            {/* Rank Column */}
            <View className="w-10 items-center justify-center mr-2.5">
              {getRankIcon(index)}
            </View>

            {/* User Info Column */}
            <View className="flex-1 flex-row items-center mr-2.5">
              <View className="mr-3">
                <UserAvatar
                  name={item.name}
                  avatar={item.avatar}
                  size={36}
                  color={item.id === currentUserId ? "#63B995" : "#ccc"}
                />
              </View>

              <View className="flex-1">
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  className={`
                    text-base font-semibold
                    ${item.id === currentUserId 
                      ? "text-light-100 font-bold" 
                      : "text-text-main dark:text-text-inverted"
                    }
                  `}
                >
                  {item.name}
                </Text>
              </View>
            </View>

            {/* Score Column */}
            <View className="flex-row items-end min-w-[60px] justify-end">
              <Text className="text-lg font-bold text-light-100">
                {item.score}
              </Text>
              <Text className="text-xs text-light-100 mb-0.5 ml-0.5 font-semibold">
                 pts
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}