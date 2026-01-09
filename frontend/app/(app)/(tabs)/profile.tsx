import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';

export default function Profile() {
  const { user, signout } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1 px-6 pt-10">
        
        {/* Profile Header */}
        <View className="items-center mb-10">
          <View className="w-24 h-24 bg-secondary rounded-full items-center justify-center mb-4">
            <Text className="text-light-100 text-3xl font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text className="text-2xl font-bold text-secondary">{user?.email}</Text>
          <Text className="text-gray-500">User Name</Text>
        </View>

        {/* Settings Area */}
        <View className="flex-1">
          <Text className="text-gray-400 font-semibold mb-4 uppercase tracking-widest text-xs">
            Account Actions
          </Text>
          
          <TouchableOpacity 
            onPress={signout}
            activeOpacity={0.7}
            className="flex-row items-center bg-red-50 p-4 rounded-2xl border border-red-100"
          >
            <View className="flex-1">
              <Text className="text-red-600 font-bold text-lg">Sign Out</Text>
              <Text className="text-red-400 text-sm">Log out of mock session</Text>
            </View>
            {/* You can put a chevron icon here if you have one */}
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}