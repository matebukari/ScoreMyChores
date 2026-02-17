import React from "react";
import { View, Text, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";

export default function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <View className="mb-6">
      <Text className="text-lg font-bold text-text-main dark:text-text-inverted mb-3">
        App Settings
      </Text>
      
      <View className="bg-card dark:bg-dark-100 p-5 rounded-2xl flex-row justify-between items-center shadow-sm border border-border-light dark:border-border-subtle">
        <View className="flex-row items-center gap-3">
          <View className={`w-10 h-10 rounded-full items-center justify-center ${colorScheme === 'dark' ? 'bg-gray-700' : 'bg-orange-50'}`}>
            <Ionicons 
              name={colorScheme === 'dark' ? "moon" : "sunny"} 
              size={20} 
              color={colorScheme === 'dark' ? "#FFD700" : "#F57C00"} 
            />
          </View>
          <View>
            <Text className="text-base font-semibold text-text-main dark:text-text-inverted">
              Dark Mode
            </Text>
            <Text className="text-xs text-text-muted dark:text-gray-400">
              {colorScheme === 'dark' ? 'On' : 'Off'}
            </Text>
          </View>
        </View>

        <Switch
          value={colorScheme === 'dark'}
          onValueChange={toggleColorScheme}
          trackColor={{ false: '#E0E0E0', true: '#63B995' }}
          thumbColor={'#FFFFFF'}
        />
      </View>
    </View>
  );
}