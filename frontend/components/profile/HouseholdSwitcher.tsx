import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface HouseholdSwitcherProps {
  joinedHouseholds: string[];
  activeHouseholdId: string | undefined;
  householdNames: Record<string, string>;
  switching: boolean;
  onSwitch: (id: string) => void;
}

export default function HouseholdSwitcher({
  joinedHouseholds,
  activeHouseholdId,
  householdNames,
  switching,
  onSwitch,
}: HouseholdSwitcherProps) {
  if (joinedHouseholds.length <= 1) return null;

  return (
    <View className="mb-6">
      <Text className="text-lg font-bold text-text-main dark:text-text-inverted mb-[15px]">
        Switch Household
      </Text>
      
      {joinedHouseholds.map((houseId) => {
        const isActive = houseId === activeHouseholdId;
        return (
          <TouchableOpacity
            key={houseId}
            className={`
              p-4 rounded-xl mb-2.5 flex-row justify-between items-center border
              ${isActive 
                ? "bg-green-50 dark:bg-gray-800 border-light-100 dark:border-light-100" 
                : "bg-white dark:bg-card-dark border-border-light dark:border-gray-700"
              }
            `}
            onPress={() => onSwitch(houseId)}
            disabled={switching}
          >
            <Text 
              className={`
                font-medium
                ${isActive 
                  ? "text-light-100 font-bold" 
                  : "text-text-muted dark:text-gray-400"
                }
              `}
            >
              {householdNames[houseId] || "Loading..."}
            </Text>
            {isActive && (
              <Ionicons name="checkmark-circle" size={20} color="#63B995" />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}