import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { householdService } from "@/services/householdService";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const MAX_HOUSEHOLD_NAME_LENGTH = 20;

export default function HouseholdSetup() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form state
  const [houseName, setHouseName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const insets = useSafeAreaInsets();

  const handleCreate = async () => {
    if (!houseName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing Name',
        text2: 'Please enter a household name.'
      });
      return;
    }
    setLoading(true);
    try {
      if (user) {
        await householdService.createHousehold(user.uid, houseName);
        router.replace("/");
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Creation Failed',
        text2: 'Could not create household. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing Code',
        text2: 'Please enter an invite code.'
      });
      return;
    }
    setLoading(true);
    try {
      if (user) {
        await householdService.joinHousehold(user.uid, inviteCode.toUpperCase());
        router.replace('/');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Join Failed',
        text2: 'Invalid invite code or network error.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      className="flex-1 bg-background dark:bg-background-dark"
    >
      <View 
        className="flex-1"
        style={{ 
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          paddingBottom: insets.bottom + 10
        }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: 40, 
            paddingHorizontal: 24,
            paddingBottom: insets.bottom, 
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 rounded-full bg-white dark:bg-card-dark justify-center items-center mb-5 shadow-lg shadow-light-100/20 elevation-5">
              <Ionicons name="home" size={48} color="#63B995" />
            </View>
            <Text className="text-3xl font-bold text-text-main dark:text-text-inverted text-center">
              Welcome Home
            </Text>
            <Text className="text-base text-text-secondary dark:text-gray-400 mt-2.5 text-center px-5 leading-6">
              Create a new household or join an existing one to get started.
            </Text>
          </View>

          {/* Option A: Create */}
          <View className="bg-white dark:bg-card-dark p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 justify-center items-center mr-3">
                <Ionicons name="add" size={24} color="#63B995" />
              </View>
              <Text className="text-lg font-bold text-text-main dark:text-text-inverted">
                Create New Household
              </Text>
            </View>
            
            <Text className="text-sm text-text-muted dark:text-gray-400 mb-5">
              Start fresh and invite your family or roommates.
            </Text>
            
            <TextInput
              placeholder="Household Name (e.g. The Smiths)"
              placeholderTextColor="#9CA3AF"
              className="bg-gray-50 dark:bg-dark-200 border border-gray-200 dark:border-gray-600 p-4 rounded-xl text-base text-text-main dark:text-text-inverted mb-2"
              value={houseName}
              onChangeText={setHouseName}
              maxLength={MAX_HOUSEHOLD_NAME_LENGTH}
            />

            <Text className="text-right text-xs text-text-muted dark:text-gray-500 mb-4 mr-1">
              {houseName.length}/{MAX_HOUSEHOLD_NAME_LENGTH}
            </Text>

            <TouchableOpacity
              className="bg-light-100 shadow-md shadow-light-100/30 p-4 rounded-xl items-center justify-center elevation-4"
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-base">
                  Create Household
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-8">
            <View className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-700" />
            <Text className="mx-4 text-xs font-bold text-text-muted dark:text-gray-500 tracking-widest">
              OR
            </Text>
            <View className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-700" />
          </View>

          {/* Option B: Join */}
          <View className="bg-white dark:bg-card-dark p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 justify-center items-center mr-3">
                <Ionicons name="enter-outline" size={24} color="#42A5F5" />
              </View>
              <Text className="text-lg font-bold text-text-main dark:text-text-inverted">
                Join with Code
              </Text>
            </View>

            <Text className="text-sm text-text-muted dark:text-gray-400 mb-5">
              Enter the invite code shared by your admin.
            </Text>

            <TextInput
              placeholder="6-Digit Invite Code"
              placeholderTextColor="#9CA3AF"
              className="bg-gray-50 dark:bg-dark-200 border border-gray-200 dark:border-gray-600 p-4 rounded-xl text-base text-text-main dark:text-text-inverted mb-4"
              autoCapitalize="characters"
              value={inviteCode}
              onChangeText={setInviteCode}
              maxLength={6}
            />
            <TouchableOpacity
              className="bg-white dark:bg-transparent border-2 border-light-100 p-4 rounded-xl items-center justify-center"
              onPress={handleJoin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#63B995" />
              ) : (
                <Text className="text-light-100 font-bold text-base">
                  Join Household
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}