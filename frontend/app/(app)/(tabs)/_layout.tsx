import React from 'react';
import { Text, View, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Icons } from '@/constants/icons';

const TabIcon = ({ focused, icon: Icon , title }: any) => {
  // Use your primary purple for active, gray for inactive
  const activeColor = "#6200ee"; 
  const inactiveColor = "#9CA3AF";

  if (focused) {
    return(
      <View className="items-center justify-center w-24 mt-2">
        <Icon width={24} height={24} color={activeColor}/>
        <Text 
          className="text-xs font-semibold text-center mt-1" 
          style={{ color: activeColor }}
        >
          {title}
        </Text>
      </View>
    )
  }

  return(
    <View className="items-center justify-center w-24 mt-2">
      <Icon width={24} height={24} color={inactiveColor}/>
      <Text 
        className="text-xs font-normal text-center mt-1" 
        style={{ color: inactiveColor }}
      >
        {title}
      </Text>
    </View>
  )
}

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          height: "100%", 
        },
        tabBarStyle: {
          backgroundColor: "#FFFFFF", 
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
          height: Platform.OS === 'ios' ? 100 : 90,
          paddingTop: 15,
          paddingBottom: Platform.OS === 'ios' ? 35 : 30,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ 
          title: 'Home',  
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={Icons.Home} title="Home"/>
          )
        }}
      />
      <Tabs.Screen
        name="chores"
        options={{ 
          title: 'Chores',  
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={Icons.Chores} title="Chores"/>
          )
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{ 
          title: 'Leaderboard',  
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={Icons.Leaderboard} title="Leaderboard"/>
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ 
          title: 'Profile',  
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={Icons.Profile} title="Profile"/>
          )
        }}
      />
    </Tabs>
  )
}

export default _layout;