import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AddChoreModal from "@/components/chores/AddChoreModal";
import ChoreList from "@/components/chores/ChoreList";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

import { useChoresScreen } from "@/hooks/useChoresScreen";

export default function ChoresScreen() {
  const {
    chores,
    loading,
    memberProfiles,
    currentUserId,
    isAdmin,
    isModalVisible,
    setIsModalVisible,
    handleAddChoreSubmit,
    handleDeleteChore,
    handleDeleteAll,
    handleResetAll,
    handleResetSingle,
    alertConfig,
    closeAlert,
    // Add Chore Form Props
    choreTitle, 
    setChoreTitle,
    chorePoints, 
    setChorePoints,
    handlePointChange,
    showPointOptions, 
    setShowPointOptions,
    isAddingChore,
    showScheduler, 
    setShowScheduler,
    selectedDate, 
    setSelectedDate,
    selectedHour, 
    setSelectedHour,
    selectedMinute, 
    setSelectedMinute,
    recentTasks,
    handleSelectRecent,
    POINT_OPTIONS
  } = useChoresScreen();

  const insets = useSafeAreaInsets();
  const safeTop =
    insets.top > 0 ? insets.top : Platform.OS === "android" ? 30 : 0;

  return (
    <View
      className="flex-1 bg-background dark:bg-background-dark"
      style={{
        paddingTop: safeTop,
        paddingLeft: insets.left + 20,
        paddingRight: insets.right + 20,
      }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mt-10 mb-5">
        <Text className="text-3xl font-bold text-text-main dark:text-text-inverted">
          Manage Chores
        </Text>
        
        {isAdmin && (
          <View className="flex-row gap-3">
            {chores.length > 0 && (
              <>
                <TouchableOpacity
                  className="bg-info w-12 h-12 rounded-full justify-center items-center shadow-sm active:opacity-80"
                  onPress={handleResetAll}
                >
                  <Ionicons name="refresh" size={22} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-danger-bright w-12 h-12 rounded-full justify-center items-center shadow-sm active:opacity-80"
                  onPress={handleDeleteAll}
                >
                  <Ionicons name="trash-bin-outline" size={22} color="white" />
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              className="bg-light-100 w-12 h-12 rounded-full justify-center items-center shadow-sm active:opacity-80"
              onPress={() => setIsModalVisible(true)}
            >
              <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ChoreList
        chores={chores}
        loading={loading}
        isAdmin={isAdmin}
        currentUserId={currentUserId}
        memberProfiles={memberProfiles}
        onReset={handleResetSingle}
        onDelete={handleDeleteChore}
      />

      <ConfirmationModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmText={alertConfig.confirmText}
        isDestructive={alertConfig.isDestructive}
        onConfirm={alertConfig.onConfirm}
        onCancel={closeAlert}
      />

      {/* ADD CHORE MODAL */}
      <AddChoreModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        title={choreTitle}
        setTitle={setChoreTitle}
        points={chorePoints}
        setPoints={setChorePoints}
        onPointChange={handlePointChange}
        showPointOptions={showPointOptions}
        setShowPointOptions={setShowPointOptions}
        loading={isAddingChore}
        pointOptions={POINT_OPTIONS}
        showScheduler={showScheduler}
        setShowScheduler={setShowScheduler}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        selectedHour={selectedHour}
        onHourChange={setSelectedHour}
        selectedMinute={selectedMinute}
        onMinuteChange={setSelectedMinute}
        recentTasks={recentTasks}
        onSelectRecent={handleSelectRecent}
        onSubmit={handleAddChoreSubmit}
      />
    </View>
  );
}