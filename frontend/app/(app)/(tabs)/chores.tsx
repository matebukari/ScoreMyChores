import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";
import { useHousehold } from "@/context/HouseholdContext";
import { useChores } from "@/context/ChoreContext";
import { choreService } from "@/services/choreService";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import UserAvatar from "@/components/ui/UserAvatar";

// --- Constants ---
const POINT_OPTIONS = ["10", "20", "30", "50", "100"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const ITEM_HEIGHT = 50;
const WHEEL_WIDTH = 65;
const VISIBLE_ITEMS = 3;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

export default function ChoresScreen() {
  const { user } = useAuth();
  const { activeHousehold, memberProfiles } = useHousehold();
  const { chores, addChore, loading, resetAll, resetChore } = useChores();

  // Modal & Form State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newChoreTitle, setNewChoreTitle] = useState("");
  const [newChorePoints, setNewChorePoints] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showPointOptions, setShowPointOptions] = useState(false);

  // Scheduler State
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());
  const [selectedMinute, setSelectedMinute] = useState(new Date().getMinutes());

  // Scroll Refs
  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);

  const lastHourIndex = useRef(new Date().getHours());
  const lastMinuteIndex = useRef(new Date().getMinutes());

  const insets = useSafeAreaInsets();
  const safeTop = insets.top > 0 ? insets.top : (Platform.OS === 'android' ? 30 : 0);
  const isAdmin = activeHousehold?.members?.[user?.uid || ""] === "admin";

  useEffect(() => {
    if (showScheduler) {
      setTimeout(() => {
        if (hourScrollRef.current) {
          hourScrollRef.current.scrollTo({
            y: selectedHour * ITEM_HEIGHT,
            animated: false,
          });
        }
        if (minuteScrollRef.current) {
          minuteScrollRef.current.scrollTo({
            y: selectedMinute * ITEM_HEIGHT,
            animated: false,
          });
        }
      }, 100);
    }
  }, [showScheduler]);

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
    setValue: (val: number) => void,
    lastValRef: { current: number },
    max: number,
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    let index = Math.round(offsetY / ITEM_HEIGHT);
    if (index < 0) index = 0;
    if (index > max) index = max;

    if (index !== lastValRef.current) {
      Haptics.selectionAsync();
      setValue(index);
      lastValRef.current = index;
    }
  };

  const handleAddChore = async () => {
    if (!newChoreTitle || !newChorePoints) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setIsAdding(true);

      let scheduledFor = null;
      if (showScheduler) {
        scheduledFor = new Date(selectedDate);
        scheduledFor.setHours(selectedHour);
        scheduledFor.setMinutes(selectedMinute);

        // --- NEW VALIDATION: Check for past time ---
        const now = new Date();
        if (scheduledFor < now) {
          Alert.alert("Invalid Time", "You cannot schedule a task for the past.");
          setIsAdding(false);
          return;
        }
        // -------------------------------------------
      }

      await addChore(newChoreTitle, parseInt(newChorePoints), scheduledFor);

      setNewChoreTitle("");
      setNewChorePoints("");
      setShowPointOptions(false);
      setShowScheduler(false);
      setIsModalVisible(false);
      // Reset scheduler to "now" for next time
      const now = new Date();
      setSelectedDate(now);
      setSelectedHour(now.getHours());
      setSelectedMinute(now.getMinutes());
    } catch (error) {
      Alert.alert("Error", "Failed to add chore");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteChore = (id: string) => {
    if (!isAdmin) {
      Alert.alert("Permission Denied", "Only the household admin can delete chores.");
      return;
    }
    Alert.alert("Delete Chore", "Are you sure you want to remove this chore?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => await choreService.deleteChore(id) },
    ]);
  };

  const handleDeleteAll = () => {
    if (!isAdmin || chores.length === 0) return;
    Alert.alert("Delete ALL Chores", "WARNING: This will remove every single task.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete All",
        style: "destructive",
        onPress: async () => {
          try {
            const promises = chores.map((chore) => choreService.deleteChore(chore.id));
            await Promise.all(promises);
          } catch (error) {
            Alert.alert("Error", "Failed to delete all chores.");
          }
        },
      },
    ]);
  };

  const handleResetAll = () => {
    Alert.alert("Reset All", "Make all chores 'Pending' again?", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", onPress: resetAll },
    ]);
  };

  const handleResetSingle = (id: string) => {
    Alert.alert("Reset Chore", "Make this chore available again?", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", onPress: async () => await resetChore(id) },
    ]);
  };

  // --- Calendar Helpers ---
  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Get "Today" at 00:00:00 for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const slots = [];
    for (let i = 0; i < firstDay; i++) {
      slots.push(<View key={`empty-${i}`} style={styles.calDay} />);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected =
        selectedDate.getDate() === i &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year;

      // Check if this day is in the past
      const thisDate = new Date(year, month, i);
      const isPast = thisDate < today;

      slots.push(
        <TouchableOpacity
          key={i}
          style={styles.calDay}
          disabled={isPast}
          onPress={() => setSelectedDate(new Date(year, month, i))}
        >
          <View
            style={[
              styles.dayBubble,
              isSelected && styles.dayBubbleSelected,
              isPast && { opacity: 0.8 }
            ]}
          >
            <Text
              style={[
                styles.calDayText,
                isSelected && styles.calDayTextSelected,
                isPast && { color: "#ccc" }
              ]}
            >
              {i}
            </Text>
          </View>
        </TouchableOpacity>,
      );
    }

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calHeader}>
          <TouchableOpacity onPress={() => setCurrentMonth(new Date(year, month - 1, 1))}>
            <Ionicons name="chevron-back" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.calTitle}>
            {MONTHS[month]} {year}
          </Text>
          <TouchableOpacity onPress={() => setCurrentMonth(new Date(year, month + 1, 1))}>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <View style={styles.calGrid}>
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <View key={d} style={styles.calDay}>
              <Text style={styles.calHeadText}>{d}</Text>
            </View>
          ))}
          {slots}
        </View>
      </View>
    );
  };

  const renderTimePicker = () => {
    const hoursData = Array.from({ length: 24 }, (_, i) => i);
    const minutesData = Array.from({ length: 60 }, (_, i) => i);

    const hourSnapOffsets = hoursData.map((_, i) => i * ITEM_HEIGHT);
    const minuteSnapOffsets = minutesData.map((_, i) => i * ITEM_HEIGHT);
    const spacerHeight = (WHEEL_HEIGHT - ITEM_HEIGHT) / 2;

    return (
      <View style={styles.timePickerContainer}>
        <Text style={styles.timeLabel}>Time available:</Text>
        <View style={styles.wheelsRow}>
          {/* Hour Wheel */}
          <View style={styles.wheelWrapper}>
            <Text style={styles.wheelLabel}>Hour</Text>
            <View style={styles.wheelContainer}>
              <View style={styles.selectionOverlay} pointerEvents="none" />
              <ScrollView
                ref={hourScrollRef}
                style={styles.wheel}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
                snapToOffsets={hourSnapOffsets}
                snapToAlignment="start"
                decelerationRate="fast"
                scrollEventThrottle={16}
                onScroll={(e) => handleScroll(e, setSelectedHour, lastHourIndex, 23)}
              >
                <View style={{ height: spacerHeight }} />
                {hoursData.map((h) => (
                  <View key={`h-${h}`} style={styles.wheelItem}>
                    <Text style={[styles.wheelText, selectedHour === h && styles.wheelTextSelected]}>
                      {h.toString().padStart(2, "0")}
                    </Text>
                  </View>
                ))}
                <View style={{ height: spacerHeight }} />
              </ScrollView>
            </View>
          </View>

          {/* Centered Colon */}
          <View style={styles.colonWrapper}>
            <Text style={styles.timeColon}>:</Text>
          </View>

          {/* Minute Wheel */}
          <View style={styles.wheelWrapper}>
            <Text style={styles.wheelLabel}>Min</Text>
            <View style={styles.wheelContainer}>
              <View style={styles.selectionOverlay} pointerEvents="none" />
              <ScrollView
                ref={minuteScrollRef}
                style={styles.wheel}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
                snapToOffsets={minuteSnapOffsets}
                snapToAlignment="start"
                decelerationRate="fast"
                scrollEventThrottle={16}
                onScroll={(e) => handleScroll(e, setSelectedMinute, lastMinuteIndex, 59)}
              >
                <View style={{ height: spacerHeight }} />
                {minutesData.map((m) => (
                  <View key={`m-${m}`} style={styles.wheelItem}>
                    <Text style={[styles.wheelText, selectedMinute === m && styles.wheelTextSelected]}>
                      {m.toString().padStart(2, "0")}
                    </Text>
                  </View>
                ))}
                <View style={{ height: spacerHeight }} />
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderStatusBadge = (item: any) => {
    const isMe = item.inProgressBy === user?.uid || item.completedBy === user?.uid;
    const getLiveProfile = (userId: string, snapshotName: string, snapshotAvatar: string) => {
      const liveUser = memberProfiles[userId];
      return {
        name: liveUser?.displayName || snapshotName || "Unknown",
        avatar: liveUser?.photoURL || snapshotAvatar || null,
      };
    };
    if (item.inProgress && !isMe) {
      const worker = getLiveProfile(item.inProgressBy, item.inProgressByName, item.inProgressByAvatar);
      return (
        <View style={[styles.badge, { backgroundColor: "#FFF3E0", borderColor: "#FFB74D" }]}>
          <UserAvatar 
            name={worker.name} 
            avatar={worker.avatar} 
            color="#F57C00"
            size={22}
            fontSize={10}
          />
          <Text style={[styles.badgeText, { color: "#E65100" }]}>{worker.name} is working</Text>
        </View>
      );
    }
    if (item.inProgress && isMe)
      return (
        <View style={[styles.badge, { backgroundColor: "#E3F2FD", borderColor: "#64B5F6" }]}>
          <Text style={{ fontSize: 14, marginRight: 4 }}>{user?.photoURL || "👤"}</Text>
          <Text style={[styles.badgeText, { color: "#1565C0" }]}>Doing Now</Text>
        </View>
      );
    if (item.completed && !isMe) {
      const completer = getLiveProfile(item.completedBy, item.completedByName, item.completedByAvatar);
      return (
        <View style={[styles.badge, { backgroundColor: "#E8F5E9", borderColor: "#81C784" }]}>
          <UserAvatar 
            name={completer.name} 
            avatar={completer.avatar} 
            color="#388E3C"
            size={22}
            fontSize={10} 
          />
          <Text style={[styles.badgeText, { color: "#2E7D32" }]}>Done by {completer.name}</Text>
        </View>
      );
    }
    if (item.completed && isMe) {
      const completer = getLiveProfile(user?.uid || "", item.completedByName, item.completedByAvatar);
      return (
        <View style={[styles.badge, { backgroundColor: "#F3E5F5", borderColor: "#BA68C8" }]}>
          <UserAvatar 
            name={completer.name}
            avatar={completer.avatar}
            color="#7B1FA2"
            size={22}
            fontSize={10}
          />
          <Text style={[styles.badgeText, { color: "#7B1FA2" }]}>Done by You</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, { paddingTop: safeTop, paddingLeft: insets.left + 20, paddingRight: insets.right + 20 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Chores</Text>
        {isAdmin && (
          <View style={styles.headerActions}>
            {chores.length > 0 && (
              <>
                <TouchableOpacity style={styles.resetAllButton} onPress={handleResetAll}>
                  <Ionicons name="refresh" size={22} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteAllButton} onPress={handleDeleteAll}>
                  <Ionicons name="trash-bin-outline" size={22} color="white" />
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
              <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#63B995" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={chores}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: "#888", marginTop: 20 }}>
              No chores yet. {isAdmin ? "Add one!" : "Ask your admin to add some."}
            </Text>
          }
          renderItem={({ item }) => (
            <View style={[styles.listCard, item.completed && { opacity: 0.8 }]}>
              <View style={styles.cardLeftContent}>
                <Text style={[styles.choreTitle, item.completed && { textDecorationLine: "line-through", color: "#999" }]}>
                  {item.title}
                </Text>
                {renderStatusBadge(item)}
              </View>
              <View style={styles.rightActions}>
                <Text style={styles.pointsText}>{item.points} pts</Text>
                {isAdmin && (
                  <View style={styles.adminRow}>
                    <TouchableOpacity onPress={() => handleResetSingle(item.id)}>
                      <Ionicons name="refresh-circle-outline" size={26} color="#2196F3" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteChore(item.id)}>
                      <Ionicons name="trash-outline" size={22} color="#FF5252" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}
        />
      )}

      {/* ADD CHORE MODAL */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>Add New Chore</Text>
              <TextInput
                style={styles.input}
                placeholder="Chore Name (e.g. Fold Laundry)"
                value={newChoreTitle}
                onChangeText={setNewChoreTitle}
              />

              {/* Points dropdown */}
              <View style={styles.dropdownContainer}>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.inputFlex}
                    placeholder="Points (e.g. 50)"
                    value={newChorePoints}
                    onChangeText={setNewChorePoints}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity style={styles.dropdownToggle} onPress={() => setShowPointOptions(!showPointOptions)}>
                    <Ionicons name={showPointOptions ? "chevron-up" : "chevron-down"} size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                {showPointOptions && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                    {POINT_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setNewChorePoints(opt);
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
              <TouchableOpacity style={styles.scheduleLink} onPress={() => setShowScheduler(!showScheduler)}>
                <Ionicons name="calendar-outline" size={16} color="#63B995" />
                <Text style={styles.scheduleLinkText}>{showScheduler ? "Hide Scheduler" : "Schedule for later?"}</Text>
              </TouchableOpacity>

              {/* Scheduler UI */}
              {showScheduler && (
                <View style={styles.schedulerContainer}>
                  {renderCalendar()}
                  {renderTimePicker()}
                </View>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setIsModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleAddChore}
                  disabled={isAdding}
                >
                  {isAdding ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Add Task</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  headerActions: { flexDirection: "row", gap: 12 },
  title: { fontSize: 28, fontWeight: "bold", color: "#333" },
  addButton: {
    backgroundColor: "#63B995",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  deleteAllButton: {
    backgroundColor: "#FF5252",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  resetAllButton: {
    backgroundColor: "#2196F3",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  listCard: {
    backgroundColor: "#fff",
    padding: 8,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
    minHeight: 70,
  },
  cardLeftContent: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 4,
  },
  choreTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "left",
  },
  rightActions: { flexDirection: "row", alignItems: "center" },
  adminRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  pointsText: { marginRight: 15, fontWeight: "bold", color: "#63B995" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    alignSelf: "flex-start",
    borderWidth: 1,
    gap: 6,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
  avatarContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "white", fontSize: 9, fontWeight: "bold" },
  // Modal Styles
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
  // Scheduler Styles
  scheduleLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
  },
  scheduleLinkText: { color: "#63B995", fontWeight: "600", fontSize: 14 },
  schedulerContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#fafafa",
  },
  calendarContainer: { marginBottom: 15 },
  calHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  calTitle: { fontWeight: "bold", fontSize: 16, color: "#333" },
  calGrid: { flexDirection: "row", flexWrap: "wrap" },
  calDay: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dayBubble: {
    width: 34,
    height: 34,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  dayBubbleSelected: {
    backgroundColor: "#63B995",
  },
  calHeadText: { fontSize: 12, color: "#999", fontWeight: "bold" },
  calDayText: { fontSize: 14, color: "#333" },
  calDayTextSelected: { color: "#fff", fontWeight: "bold" },
  // Time Picker Styles
  timePickerContainer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 15,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
  },
  wheelsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  wheelWrapper: { width: WHEEL_WIDTH, alignItems: "center" },
  wheelContainer: {
    height: WHEEL_HEIGHT,
    width: WHEEL_WIDTH,
    overflow: "hidden",
  },
  wheelLabel: {
    fontSize: 10,
    color: "#999",
    marginBottom: 5,
    height: 15,
    textAlignVertical: "center",
    textAlign: "center",
    width: "100%",
  },
  wheel: { width: WHEEL_WIDTH },
  wheelItem: {
    height: ITEM_HEIGHT,
    width: WHEEL_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  wheelText: { fontSize: 16, color: "#ccc", textAlign: "center" },
  wheelTextSelected: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#63B995",
    textAlign: "center",
  },
  colonWrapper: {
    height: WHEEL_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    width: 20,
    marginTop: 20,
  },
  timeColon: { fontSize: 24, fontWeight: "bold", color: "#333" },
  selectionOverlay: {
    position: "absolute",
    top: ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "rgba(99, 185, 149, 0.1)",
    zIndex: 10,
  },
});