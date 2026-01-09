import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  TouchableWithoutFeedback, Keyboard 
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signin } = useAuth();
  const router = useRouter();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSignIn = () => {
    if (email && password) {
      signin(email, password);
    } else {
      alert("Please enter credentials.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View 
            className="flex-1 px-8 pt-12"
            style={{ paddingBottom: keyboardVisible ? 240 : 40 }}
          >
            <View className="flex-1" />

            {/* Header */}
            <View className="mb-8">
              <Text className="text-4xl font-bold text-gray-900">Welcome Back</Text>
              <Text className="text-gray-500 mt-2">Sign in to continue testing app</Text>
            </View>
            
            <View>
              {/* Email Field */}
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">Email Address</Text>
                <TextInput
                  className="w-full h-12 border border-gray-200 rounded-xl px-4 bg-gray-50 text-black"
                  placeholder="email@example.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {/* Password Field */}
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">Password</Text>
                <TextInput
                  className="w-full h-12 border border-gray-200 rounded-xl px-4 bg-gray-50 text-black"
                  placeholder="••••••••"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {/* Sign In Button */}
              <TouchableOpacity 
                onPress={handleSignIn}
                activeOpacity={0.8}
                className="w-full h-14 bg-light-100 rounded-xl items-center justify-center mt-4 shadow-sm"
              >
                <Text className="text-white font-bold text-lg">Sign In</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600">Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text className="text-light-100 font-bold">Register</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-1" />

          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </SafeAreaView>
  );
}