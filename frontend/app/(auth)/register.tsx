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
import { AntDesign } from "@expo/vector-icons";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, googleSignIn } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill in all fields.'
      });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Password Mismatch',
        text2: 'Passwords do not match.'
      });
      return;
    }
    if (password.length < 6) {
      Toast.show({
        type: 'info',
        text1: 'Weak Password',
        text2: 'Password must be at least 6 characters.'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await register(email, password, username);
    } catch (error: any) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      await googleSignIn();
      // Navigation is handled by the listener in AuthContext
    } catch (error) {
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
          paddingRight: insets.right
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
          <View className="mb-8 mt-5">
            <Text className="text-3xl font-bold text-text-main dark:text-text-inverted mb-2">
              Create Account
            </Text>
            <Text className="text-base text-text-secondary dark:text-gray-400">
              Join us to start tracking your tasks
            </Text>
          </View>

          {/* Form */}
          <View className="w-full">
            
            {/* Username */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-text-main dark:text-gray-300 mb-2">
                Username
              </Text>
              <TextInput
                className="bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-border-subtle rounded-xl px-4 py-3.5 text-base text-text-main dark:text-text-inverted"
                placeholder="e.g. ChoreMaster99"
                placeholderTextColor={colorScheme === 'dark' ? "#9CA3AF" : "#9CA3AF"}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="words"
              />
            </View>

            {/* Email */}
            <View className="mb-4">
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

            {/* Password */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-text-main dark:text-gray-300 mb-2">
                Password
              </Text>
              <TextInput
                className="bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-border-subtle rounded-xl px-4 py-3.5 text-base text-text-main dark:text-text-inverted"
                placeholder="Minimum 6 characters"
                placeholderTextColor={colorScheme === 'dark' ? "#9CA3AF" : "#9CA3AF"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Confirm Password */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-text-main dark:text-gray-300 mb-2">
                Confirm Password
              </Text>
              <TextInput
                className="bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-border-subtle rounded-xl px-4 py-3.5 text-base text-text-main dark:text-text-inverted"
                placeholder="Re-enter password"
                placeholderTextColor={colorScheme === 'dark' ? "#9CA3AF" : "#9CA3AF"}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            {/* Register Button */}
            <TouchableOpacity
              className={`mb-4 bg-light-100 rounded-xl py-4 items-center mt-2.5 shadow-sm shadow-light-100 elevation-4 ${isSubmitting ? 'opacity-70' : ''}`}
              onPress={handleRegister}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-bold">Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center mb-4">
              <View className="flex-1 h-[1px] bg-gray-200 dark:bg-border-subtle" />
              <Text className="mx-4 text-text-secondary dark:text-gray-500 text-sm">or</Text>
              <View className="flex-1 h-[1px] bg-gray-200 dark:bg-border-subtle" />
            </View>

            {/* Google Sign In Button */}
            <TouchableOpacity
              className="mb-6 bg-white dark:bg-dark-100 border border-gray-200 dark:border-border-subtle rounded-xl py-4 flex-row items-center justify-center shadow-sm elevation-1"
              onPress={handleGoogleSignIn}
              disabled={isSubmitting}
            >
              <AntDesign name="google" size={20} color={colorScheme === 'dark' ? "white" : "black"} style={{ marginRight: 10 }} />
              <Text className="text-text-main dark:text-text-inverted text-base font-bold">
                Sign up with Google
              </Text>
            </TouchableOpacity>

            {/* Footer Link */}
            <View className="flex-row justify-center">
              <Text className="text-text-secondary dark:text-gray-400 text-sm">
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/signin")}>
                <Text className="text-light-100 text-sm font-bold">
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}