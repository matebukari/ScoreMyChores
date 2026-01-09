import React from 'react';
import { Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Icons } from '@/constants/icons';

const TabIcon = ({ focused, icon: Icon , title }: any) => {

  if (focused) {
    return(
      <View className="items-center justify-center w-24">
        <Icon width={24} height={24} color="#63B995"/>
        <Text className="text-xs text-light-100 font-semibold text-center"
        >{title}</Text>
      </View>
    )
  }

  return(
    <View className="items-center justify-center w-24">
      <Icon width={24} height={24} color="#9ca3af"/>
      <Text className="text-xs text-gray-400 font-normal text-center"
      >{title}</Text>
    </View>
  )
}

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor: "#151312",
          borderRadius: 25,
          marginHorizontal: 10,
          marginBottom: 40,
          paddingTop: 8,
          paddingBottom: 5,
          height: 55,
          position: "absolute",
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#151312",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ 
          title: 'Home',  
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              focused={focused} 
              icon={Icons.Home} 
              title="Home"
            />
          )
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{ 
          title: 'Tasks',  
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              focused={focused} 
              icon={Icons.Tasks} 
              title="Tasks"
            />
          )
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{ 
          title: 'Leaderboard',  
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              focused={focused} 
              icon={Icons.Leaderboard} 
              title="Leaderboard"
            />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ 
          title: 'Profile',  
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              focused={focused} 
              icon={Icons.Profile} 
              title="Profile"
            />
          )
        }}
      />
    </Tabs>
  )
}

export default _layout