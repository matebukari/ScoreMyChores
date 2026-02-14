import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ChoreScheduler from "@/components/chores/ChoreSchedular";

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
  onSubmit 
}: AddChoreModalProps) {

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.modalTitle}>Add New Chore</Text>

            {/* Previous Task Section */}
            {recentTasks.length > 0 && (
              <View style={styles.recentContainer}>
                <Text style={styles.sectionLabel}>Previous Tasks</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.recentList}
                  contentContainerStyle={{ paddingRight: 20 }}
                >
                  {recentTasks.map((task, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.recentChip}
                      onPress={() => onSelectRecent(task.title, task.points)}
                    >
                      <Text style={styles.recentChipText} numberOfLines={1}>
                        {task.title} <Text style={styles.recentChipPoints}>({task.points})</Text>
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.titleInputContainer}>
              <TextInput
                style={styles.titleInput}
                placeholder="Chore Name (e.g. Dishes)"
                value={title}
                onChangeText={setTitle}
                maxLength={25}
                multiline={false}
              />
              <Text style={styles.charCount}>
                {title.length}/25
              </Text>
            </View>

            {/* Points dropdown */}
            <View style={styles.dropdownContainer}>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.inputFlex}
                  placeholder="Points (e.g. 50)"
                  value={points}
                  onChangeText={onPointChange}
                  keyboardType="numeric"
                  multiline={false}
                  maxLength={3}
                />
                <TouchableOpacity
                  style={styles.dropdownToggle}
                  onPress={() => setShowPointOptions(!showPointOptions)}
                >
                  <Ionicons
                    name={showPointOptions ? "chevron-up" : "chevron-down"}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {showPointOptions && (
                <ScrollView
                  style={styles.dropdownList}
                  nestedScrollEnabled={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {pointOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setPoints(opt);
                        setShowPointOptions(false);
                      }}
                    >
                      <Text style={styles.dropDownItemText}>{opt} pts</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Schedule Link */}
            <TouchableOpacity
              style={styles.scheduleLink}
              onPress={() => setShowScheduler(!showScheduler)}
            >
              <Ionicons name="calendar-outline" size={16} color="#63B995" />
              <Text style={styles.scheduleLinkText}>
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

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={onSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Add Task</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    padding: 25,
    borderRadius: 20,
    elevation: 5,
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  recentContainer: {
    marginBottom: 15,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
    marginBottom: 8,
    marginLeft: 4,
  },
  recentList: {
    flexDirection: "row",
    marginBottom: 5,
  },
  recentChip: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    maxWidth: 160,
  },
  recentChipText: {
    color: "#166534",
    fontSize: 13,
    fontWeight: "500",
  },
  recentChipPoints: {
    fontWeight: "bold",
    opacity: 0.8,
  },
  titleInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 54,
  },
  titleInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: "100%",
    paddingRight: 10,
    paddingVertical: 0,
  },
  charCount: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
  },
  dropdownContainer: { marginBottom: 15 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    height: 54,
    paddingLeft: 15,
  },
  inputFlex: { 
    flex: 1, 
    padding: 15, 
    fontSize: 16, 
    color: "#333", 
    paddingVertical: 0,
    paddingHorizontal: 0,
    height: "100%",
  },
  dropdownToggle: { 
    paddingHorizontal: 15,
    height: "100%",
    justifyContent: "center", 
    borderLeftWidth: 1, 
    borderLeftColor: "#ddd" 
  },
  dropdownList: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    marginTop: 5,
    maxHeight: 135,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f8f8f8",
  },
  dropDownItemText: { fontSize: 16, color: "#333" },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: { backgroundColor: "#ccc" },
  saveButton: { backgroundColor: "#63B995" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  scheduleLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
  },
  scheduleLinkText: { color: "#63B995", fontWeight: "600", fontSize: 14 },
});