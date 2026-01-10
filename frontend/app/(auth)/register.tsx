import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  TouchableWithoutFeedback, 
  Keyboard,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const router = useRouter();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Listen for keyboard to adjust padding
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleRegister = async () => {

    if (!email || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 charachters.");
      return;
    }

    try {
      setIsSubmitting(true);
      await register(email, password);
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
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
            {/* Spacer for centering content */}
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
                  className="w-full h-12 border border-gray-200 rounded-xl px-4 bg-gray-50 text-black"
                  placeholder="newuser@example.com"
                  placeholderTextColor="#9CA3AF"
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
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {/* Confirm Password Field */}
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">Confirm Password</Text>
                <TextInput
                  className="w-full h-12 border border-gray-200 rounded-xl px-4 bg-gray-50 text-black"
                  placeholder="Re-enter password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              {/* Create Account Button */}
              <TouchableOpacity 
                onPress={handleRegister}
                disabled={isSubmitting}
                activeOpacity={0.8}
                className={`w-full h-14 rounded-xl items-center justify-center mt-4 shadow-sm ${
                  isSubmitting ? "bg-gray-400" : "bg-light-100"
                }`}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">Create Account</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signin')}>
                <Text className="text-light-100 font-bold">Sign In</Text>
              </TouchableOpacity>
            </View>
            
            {/* Bottom Spacer */}
            <View className="flex-1" />

          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </SafeAreaView>
  );
}