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
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useColorScheme } from "nativewind";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signin } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();

  const handleSignIn = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill in all fields.'
      });
      return;
    }
    try {
      setIsSubmitting(true);
      await signin(email, password);
    } catch (error: any) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      className="flex-1 bg-white dark:bg-background-dark"
    >
      <View
        className="flex-1"
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }}
      >
        <ScrollView
          contentContainerStyle={{ 
            flexGrow: 1, 
            justifyContent: "center", 
            paddingHorizontal: 24, 
            paddingBottom: 20 
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="mb-10 mt-5">
            <Text className="text-3xl font-bold text-text-main dark:text-text-inverted mb-2">
              Welcome Back!
            </Text>
            <Text className="text-base text-text-secondary dark:text-gray-400">
              Sign in to continue tracking your chores
            </Text>
          </View>

          {/* Form */}
          <View className="w-full">
            {/* Email Input */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-text-main dark:text-gray-300 mb-2">
                Email Address
              </Text>
              <TextInput
                className="bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-border-subtle rounded-xl px-4 py-3.5 text-base text-text-main dark:text-text-inverted"
                placeholder="you@example.com"
                placeholderTextColor={colorScheme === 'dark' ? "#9CA3AF" : "#9CA3AF"}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Password Input */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-text-main dark:text-gray-300 mb-2">
                Password
              </Text>
              <TextInput
                className="bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-border-subtle rounded-xl px-4 py-3.5 text-base text-text-main dark:text-text-inverted"
                placeholder="Enter your password"
                placeholderTextColor={colorScheme === 'dark' ? "#9CA3AF" : "#9CA3AF"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              className={`mb-6 bg-light-100 rounded-xl py-4 items-center mt-2.5 shadow-sm shadow-light-100 elevation-4 ${isSubmitting ? 'opacity-70' : ''}`}
              onPress={handleSignIn}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-bold">Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Footer Link */}
            <View className="flex-row justify-center">
              <Text className="text-text-secondary dark:text-gray-400 text-sm">
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text className="text-light-100 text-sm font-bold">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}