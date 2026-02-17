import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from "react-native";
import { Avatars } from "@/constants/avatars";

const AVATAR_CATEGORIES = [
  {
    title: "Human",
    data: [
      "human1", "human2", "human3", "human4", "human5", "human6", "human7",
      "human8", "human9", "human10", "human11", "human12", "human13",
      "human14", "human15", "human16", "human17", "human18", "human19",
      "human20", "human21",
    ],
  },
  {
    title: "Premium",
    data: [
      "premium1", "premium2", "premium3", "premium4", "premium5", "premium6",
      "premium7", "premium8", "premium9", "premium10", "premium11",
      "premium12", "premium13", "premium14", "premium15", "premium16",
      "premium17", "premium18", "premium19",
    ],
  },
];

// Flatten the list for the grid
const ALL_AVATARS = AVATAR_CATEGORIES.flatMap((category) => category.data);

interface AvatarPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (newAvatar: string) => void;
  currentAvatar?: string;
}

export default function AvatarPickerModal({
  visible,
  onClose,
  onSelect,
  currentAvatar,
}: AvatarPickerModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white dark:bg-card-dark w-full max-w-[350px] h-[70%] rounded-3xl p-5 shadow-xl">
          <Text className="text-xl font-bold mb-5 text-center text-text-main dark:text-text-inverted">
            Pick an Avatar
          </Text>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <View className="flex-row flex-wrap justify-center gap-3">
              {ALL_AVATARS.map((avatarKey) => {
                const SvgComponent = Avatars[avatarKey];
                const isSelected = currentAvatar === avatarKey;

                return (
                  <TouchableOpacity
                    key={avatarKey}
                    onPress={() => {
                      onSelect(avatarKey);
                      onClose();
                    }}
                    className={`
                      w-[70px] h-[70px] rounded-full justify-center items-center border-2 overflow-hidden
                      ${isSelected 
                        ? "border-light-100 bg-green-50 dark:bg-green-900/20" 
                        : "border-transparent bg-gray-50 dark:bg-gray-700"
                      }
                    `}
                  >
                    {SvgComponent ? (
                      <View className="w-[60px] h-[60px]">
                        <SvgComponent width="100%" height="100%" />
                      </View>
                    ) : (
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        ?
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View className="mt-4 pt-2 border-t border-gray-100 dark:border-gray-700">
            <TouchableOpacity 
              className="bg-gray-200 dark:bg-gray-700 py-3.5 rounded-xl items-center w-full" 
              onPress={onClose}
            >
              <Text className="text-gray-700 dark:text-gray-300 font-bold text-base">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}