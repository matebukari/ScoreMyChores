import React from "react";
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity,
  ActivityIndicator 
} from "react-native";

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="fade" 
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-5">
        <View className="bg-white dark:bg-card-dark rounded-2xl p-6 w-full max-w-[340px] shadow-xl">
          <Text className="text-xl font-bold text-text-main dark:text-text-inverted mb-2 text-center">
            {title}
          </Text>
          <Text className="text-base text-text-secondary dark:text-gray-400 text-center mb-6 leading-6">
            {message}
          </Text>

          <View className="flex-row gap-3">
            {/* Cancel Button */}
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl items-center justify-center bg-gray-100 dark:bg-gray-700"
              onPress={onCancel}
              disabled={loading}
            >
              <Text className="text-base font-semibold text-text-secondary dark:text-gray-300">
                {cancelText}
              </Text>
            </TouchableOpacity>

            {/* Confirm Button */}
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl items-center justify-center ${
                isDestructive ? "bg-danger-bright" : "bg-light-100"
              }`}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-base font-semibold text-white">
                  {confirmText}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}