import React, { useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from "react-native";

interface CreateHouseholdModalProps {
  visible: boolean;
  onClose: () => void;
  householdName: string;
  setHouseholdName: (name: string) => void;
  onCreate: () => void;
  loading: boolean;
}

export default function CreateHouseholdModal({
  visible,
  onClose,
  householdName,
  setHouseholdName,
  onCreate,
  loading,
}: CreateHouseholdModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const householdNameInputRef = useRef<TextInput>(null);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      onShow={() => {
        setTimeout(() => {
          householdNameInputRef.current?.focus();
        }, 100);
      }}
    >
      <View className="flex-1 bg-black/50">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "padding"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
        >
          <View className="flex-1 justify-center items-center p-4">
            <View className="bg-white dark:bg-card-dark w-full max-w-[340px] rounded-2xl p-6 shadow-xl">
              <Text className="text-xl font-bold mb-1.5 text-center text-text-main dark:text-text-inverted">
                Create Household
              </Text>
              <Text className="text-sm text-text-muted dark:text-gray-400 mb-5 text-center">
                Name your new household to get started.
              </Text>

              <TextInput
                ref={householdNameInputRef}
                className="bg-gray-50 dark:bg-dark-100 text-text-main dark:text-text-inverted p-4 rounded-xl mb-5 text-base border border-gray-200 dark:border-gray-600 focus:border-light-100 dark:focus:border-light-100"
                placeholder="Ex: Our Sweet Home"
                placeholderTextColor={isDark ? "#9CA3AF" : "#9CA3AF"}
                value={householdName}
                onChangeText={setHouseholdName}
                autoCapitalize="words"
              />

              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 bg-gray-200 dark:bg-gray-700 p-3.5 rounded-xl items-center"
                  onPress={onClose}
                  disabled={loading}
                >
                  <Text className="text-gray-700 dark:text-gray-300 font-bold text-base">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-light-100 p-3.5 rounded-xl items-center"
                  onPress={onCreate}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-white font-bold text-base">
                      Create
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
