import React from "react";
import { Text, View, Platform } from "react-native";
import { withLayoutContext } from "expo-router";
import { useColorScheme } from "nativewind";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Icons } from "@/constants/icons";

const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);

interface TabIconProps {
  focused: boolean;
  icon: any;
  title: string;
}

const TabIcon = ({ focused, icon: Icon, title }: TabIconProps) => {
  const activeColor = "#63B995";
  const inactiveColor = "#9CA3AF";

  return (
    <View className="items-center justify-center w-24">
      <Icon
        width={24}
        height={24}
        color={focused ? activeColor : inactiveColor}
      />
      <Text
        className={`text-xs text-center mt-1 ${focused ? "font-semibold" : "font-normal"}`}
        style={{ color: focused ? activeColor : inactiveColor }}
      >
        {title}
      </Text>
    </View>
  );
};

const _layout = () => {
  const { colorScheme } = useColorScheme();

  const themeColors = {
    background: colorScheme === "dark" ? "#151312" : "#FFFFFF",
    border: colorScheme === "dark" ? "#272a2b" : "#F3F4F6",
  };
  return (
    <MaterialTopTabs
      tabBarPosition="bottom"
      screenOptions={{
        tabBarShowLabel: false,
        tabBarShowIcon: true,
        tabBarIndicatorStyle: { height: 0, backgroundColor: "transparent" },
        swipeEnabled: true,
        animationEnabled: true,
        tabBarItemStyle: {
          height: "100%",
          justifyContent: "center",
          padding: 0,
        },
        tabBarStyle: {
          backgroundColor: themeColors.background,
          borderTopWidth: 1,
          borderTopColor: themeColors.border,
          paddingTop: 15,
          paddingBottom: Platform.OS === "ios" ? 35 : 30,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <MaterialTopTabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon focused={focused} icon={Icons.Home} title="Home" />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="chores"
        options={{
          title: "Chores",
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon focused={focused} icon={Icons.Chores} title="Chores" />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon
              focused={focused}
              icon={Icons.Leaderboard}
              title="Leaderboard"
            />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon focused={focused} icon={Icons.Profile} title="Profile" />
          ),
        }}
      />
    </MaterialTopTabs>
  );
};

export default _layout;
