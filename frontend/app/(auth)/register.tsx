import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  TouchableWithoutFeedback, Keyboard 
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();
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

  const handleRegister = () => {
    if (email && password) {
      register(email, password);
    } else {
      alert("Please fill in all fields.");
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
              <Text className="text-4xl font-bold text-gray-900">Create Account</Text>
              <Text className="text-gray-500 mt-2">Join us to start tracking your tasks</Text>
            </View>

            <View>
              {/* Set Email Field */}
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">Email Address</Text>
                <TextInput
                  className="w-full h-12 border border-gray-200 rounded-xl px-4 bg-gray-50"
                  placeholder="newuser@example.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {/* Set Password Field */}
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">Password</Text>
                <TextInput
                  className="w-full h-12 border border-gray-200 rounded-xl px-4 bg-gray-50"
                  placeholder="Minimum 6 characters"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {/* Create Account Button */}
              <TouchableOpacity 
                onPress={handleRegister}
                className="w-full h-14 bg-light-100 rounded-xl items-center justify-center mt-4 shadow-sm"
              >
                <Text className="text-white font-bold text-lg">Create Account</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signin')}>
                <Text className="text-light-100 font-bold">Sign In</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-1" />

          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </SafeAreaView>
  );
}