import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ChoreScheduler from "@/components/chores/ChoreSchedular";
import Toast from "react-native-toast-message";

interface AddChoreModalProps {
  visible: boolean;
  onClose: () => void;
  // Form State
  title: string;
  setTitle: (text: string) => void;
  points: string;
  setPoints: (text: string) => void;
  onPointChange: (text: string) => void;
  // UI State
  showPointOptions: boolean;
  setShowPointOptions: (show: boolean) => void;
  loading: boolean;
  pointOptions: string[];
  // Scheduler State
  showScheduler: boolean;
  setShowScheduler: (show: boolean) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  selectedHour: number;
  onHourChange: (hour: number) => void;
  selectedMinute: number;
  onMinuteChange: (minute: number) => void;
  // Data & Handlers
  recentTasks: { title: string; points: number }[];
  onSelectRecent: (title: string, points: number) => void;
  onSubmit: () => Promise<void>;
}

export default function AddChoreModal({
  visible,
  onClose,
  title,
  setTitle,
  points,
  setPoints,
  onPointChange,
  showPointOptions,
  setShowPointOptions,
  loading,
  pointOptions,
  showScheduler,
  setShowScheduler,
  selectedDate,
  onDateChange,
  selectedHour,
  onHourChange,
  selectedMinute,
  onMinuteChange,
  recentTasks,
  onSelectRecent,
  onSubmit,
}: AddChoreModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Reference for the Title input
  const titleInputRef = useRef<TextInput>(null);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      onShow={() => {
        setTimeout(() => {
          titleInputRef.current?.focus();
        }, 100);
      }}
    >
      <View className="flex-1 bg-black/50">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "padding"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <View className="flex-1 justify-center items-center">
            <View className="bg-card dark:bg-card-dark w-[90%] p-6 rounded-3xl shadow-xl max-h-[85%]">
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Text className="text-xl font-bold mb-5 text-center text-text-main dark:text-text-inverted">
                  Add New Chore
                </Text>

                {/* Previous Task Section */}
                {recentTasks.length > 0 && (
                  <View className="mb-4">
                    <Text className="text-sm font-semibold text-text-muted dark:text-gray-400 mb-2 ml-1">
                      Previous Tasks
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      className="flex-row mb-1"
                      contentContainerStyle={{ paddingRight: 20 }}
                    >
                      {recentTasks.map((task, index) => (
                        <TouchableOpacity
                          key={index}
                          className="bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-full mr-2 border border-green-200 dark:border-green-800 max-w-[160px]"
                          onPress={() =>
                            onSelectRecent(task.title, task.points)
                          }
                        >
                          <Text
                            className="text-green-800 dark:text-green-300 text-xs font-medium"
                            numberOfLines={1}
                          >
                            {task.title}{" "}
                            <Text className="font-bold opacity-80">
                              ({task.points})
                            </Text>
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Title Input */}
                <View className="flex-row items-center bg-background-subtle dark:bg-dark-100 rounded-xl mb-4 px-4 h-[54px] border border-transparent dark:border-gray-500 focus:border-light-100">
                  <TextInput
                    ref={titleInputRef}
                    className="flex-1 text-base text-text-main dark:text-text-inverted h-full py-0"
                    placeholder="Chore Name (e.g. Dishes)"
                    placeholderTextColor={isDark ? "#9CA3AF" : "#9CA3AF"}
                    value={title}
                    onChangeText={setTitle}
                    maxLength={25}
                    multiline={false}
                  />
                  <Text className="text-xs text-text-muted dark:text-gray-500 font-medium ml-2">
                    {title.length}/25
                  </Text>
                </View>

                {/* Points dropdown */}
                <View className="mb-4">
                  <View className="flex-row items-center bg-background-subtle dark:bg-dark-100 rounded-xl h-[54px] pl-4 border border-transparent dark:border-gray-500 focus:border-light-100">
                    <TextInput
                      className="flex-1 text-base text-text-main dark:text-text-inverted h-full py-0"
                      placeholder="Points (e.g. 50)"
                      placeholderTextColor={isDark ? "#9CA3AF" : "#9CA3AF"}
                      value={points}
                      onChangeText={onPointChange}
                      keyboardType="numeric"
                      multiline={false}
                      maxLength={3}
                    />
                    <TouchableOpacity
                      className="px-4 h-full justify-center border-l border-border-light dark:border-gray-500"
                      onPress={() => setShowPointOptions(!showPointOptions)}
                    >
                      <Ionicons
                        name={showPointOptions ? "chevron-up" : "chevron-down"}
                        size={24}
                        color={isDark ? "#9CA3AF" : "#666"}
                      />
                    </TouchableOpacity>
                  </View>

                  {showPointOptions && (
                    <ScrollView
                      className="bg-card dark:bg-card-dark border border-border-light dark:border-gray-500 rounded-xl mt-1 max-h-[135px]"
                      nestedScrollEnabled={true}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                    >
                      {pointOptions.map((opt) => (
                        <TouchableOpacity
                          key={opt}
                          className="p-3 border-b border-border-subtle dark:border-gray-600 active:bg-gray-50 dark:active:bg-gray-800"
                          onPress={() => {
                            setPoints(opt);
                            setShowPointOptions(false);
                          }}
                        >
                          <Text className="text-base text-text-main dark:text-text-inverted">
                            {opt} pts
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>

                {/* Schedule Link */}
                <TouchableOpacity
                  className="flex-row items-center justify-center py-2.5 gap-1.5"
                  onPress={() => {
                    Keyboard.dismiss();
                    setShowScheduler(!showScheduler);
                  }}
                >
                  <Ionicons name="calendar-outline" size={16} color="#63B995" />
                  <Text className="text-light-100 font-semibold text-sm">
                    {showScheduler ? "Hide Scheduler" : "Schedule for later?"}
                  </Text>
                </TouchableOpacity>

                {/* Scheduler UI */}
                {showScheduler && (
                  <ChoreScheduler
                    selectedDate={selectedDate}
                    onDateChange={onDateChange}
                    selectedHour={selectedHour}
                    onHourChange={onHourChange}
                    selectedMinute={selectedMinute}
                    onMinuteChange={onMinuteChange}
                  />
                )}

                {/* Action Buttons */}
                <View className="flex-row justify-between mt-5 gap-3">
                  <TouchableOpacity
                    className="flex-1 p-4 rounded-xl items-center bg-gray-300 dark:bg-gray-600"
                    onPress={onClose}
                  >
                    <Text className="text-white font-bold text-base">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 p-4 rounded-xl items-center bg-light-100"
                    onPress={onSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-bold text-base">
                        Add Task
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
            <Toast />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
