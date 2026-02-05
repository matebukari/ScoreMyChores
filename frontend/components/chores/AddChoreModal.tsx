import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ChoreScheduler from "@/components/chores/ChoreSchedular";

const POINT_OPTIONS = ["10", "20", "30", "50", "100"];

interface AddChoreModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, points: number, scheduledFor: Date | null) =>Promise<void>;
}

export default function AddChoreModal({ visible, onClose, onAdd }: AddChoreModalProps) {
  const [title, setTitle] = useState("");
  const [points, setPoints] = useState("");
  const [showPointOptions, setShowPointOptions] = useState(false);
  const [loading, setLoading] = useState(false);

  // Schedular State
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());
  const [selectedMinute, setSelectedMinute] = useState(new Date().getMinutes());

  const handleAdd = async () => {
    if (!title || !points) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      let scheduledFor = null;
      if (showScheduler) {
        scheduledFor = new Date(selectedDate);
        scheduledFor.setHours(selectedHour);
        scheduledFor.setMinutes(selectedMinute);

        // Validation
        const now = new Date();
        if (scheduledFor < now) {
          Alert.alert("Invalid Time", "You cannot schedule a task for the past.");
          setLoading(false);
          return;
        }
      }

      await onAdd(title, parseInt(points), scheduledFor);

      // Reset form
      setTitle("");
      setPoints("");
      setShowPointOptions(false);
      setShowScheduler(false);
      const now = new Date();
      setSelectedDate(now);
      setSelectedHour(now.getHours());
      setSelectedMinute(now.getMinutes());

      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to add chore");
    } finally {
      setLoading(false);
    }
  };

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
            <TextInput
              style={styles.input}
              placeholder="Chore Name (e.g. Fold Laundry)"
              value={title}
              onChangeText={setTitle}
            />

            {/* Points dropdown */}
            <View style={styles.dropdownContainer}>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.inputFlex}
                  placeholder="Points (e.g. 50)"
                  value={points}
                  onChangeText={setPoints}
                  keyboardType="numeric"
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
                  {POINT_OPTIONS.map((opt) => (
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
                onDateChange={setSelectedDate}
                selectedHour={selectedHour}
                onHourChange={setSelectedHour}
                selectedMinute={selectedMinute}
                onMinuteChange={setSelectedMinute}
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
                onPress={handleAdd}
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
  input: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  dropdownContainer: { marginBottom: 10 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  inputFlex: { flex: 1, padding: 15, fontSize: 16, color: "#333" },
  dropdownToggle: { padding: 15, borderLeftWidth: 1, borderLeftColor: "#ddd" },
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