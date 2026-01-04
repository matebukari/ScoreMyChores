import React from 'react'
import { Tabs } from 'expo-router'
import { Icons } from '@/constants/icons'

const _layout = () => {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ 
          title: 'home',  
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <>
              <Icons.Home width={24} height={24} color={focused ? "#7D98A1" : "#9ca3af"}/>
            </>
          )
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{ 
          title: 'Tasks',  
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <>
              <Icons.Tasks width={24} height={24} color={focused ? "#7D98A1" : "#9ca3af"}/>
            </>
          )
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{ 
          title: 'Leaderboard',  
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <>
              <Icons.Leaderboard width={24} height={24} color={focused ? "#7D98A1" : "#9ca3af"}/>
            </>
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ 
          title: 'Profile',  
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <>
              <Icons.Profile width={24} height={24} color={focused ? "#7D98A1" : "#9ca3af"}/>
            </>
          )
        }}
      />
    </Tabs>
    
  )
}

export default _layout