import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ITEM_HEIGHT = 50;
const WHEEL_WIDTH = 65;
const VISIBLE_ITEMS = 3;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface ChoreSchedulerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  selectedHour: number;
  onHourChange: (hour: number) => void;
  selectedMinute: number;
  onMinuteChange: (minute: number) => void;
}

export default function ChoreScheduler({
  selectedDate,
  onDateChange,
  selectedHour,
  onHourChange,
  selectedMinute,
  onMinuteChange,
}: ChoreSchedulerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Refs for auto-scrolling
  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);
  const lastHourIndex = useRef(selectedHour);
  const lastMinuteIndex = useRef(selectedMinute);

  // Auto-scroll to current selection when component mounts
  useEffect(() => {
    setTimeout(() => {
      hourScrollRef.current?.scrollTo({
        y: selectedHour * ITEM_HEIGHT,
        animated: false,
      });
      minuteScrollRef.current?.scrollTo({
        y: selectedMinute * ITEM_HEIGHT,
        animated: false,
      });
    }, 100);
  },[]);

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
    setValue: (val: number) => void,
    lastValRef: { current: number },
    max: number
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

  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const slots = [];
    for (let i = 0; i < firstDay; i++) {
      slots.push(<View key={`empty-${i}`} style={styles.calDay} />)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected = 
        selectedDate.getDate() === i &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year;

      const thisDate = new Date(year, month, i);
      const isPast = thisDate < today;

      slots.push(
        <TouchableOpacity
          key={i}
          style={styles.calDay}
          disabled={isPast}
          onPress={() => onDateChange(new Date(year, month, i))}
        >
          <View
            style={[
              styles.dayBubble,
              isSelected && styles.dayBubbleSelected,
              isPast && { opacity: 0.8 },
            ]}
          >
            <Text
              style={[
                styles.calDayText,
                isSelected && styles.calDayTextSelected,
                isPast && { color: "#ccc" },
              ]}
            >
              {i}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calHeader}>
          <TouchableOpacity
            onPress={() => setCurrentMonth(new Date(year, month - 1, 1))}
          >
            <Ionicons name="chevron-back" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.calTitle}>
            {MONTHS[month]} {year}
          </Text>
          <TouchableOpacity
            onPress={() => setCurrentMonth(new Date(year, month + 1, 1))}
          >
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

  const renderTimeWheel = (
    data: number[],
    ref: React.RefObject<ScrollView | null>,
    selectedVal: number,
    setVal: (val: number) => void,
    lastRef: { current: number }
  ) => {
    const snapOffsets = data.map((_, i) => i * ITEM_HEIGHT);
    const spacerHeight = (WHEEL_HEIGHT - ITEM_HEIGHT) / 2;

    return (
      <ScrollView
        ref={ref}
        style={styles.wheel}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
        snapToOffsets={snapOffsets}
        snapToAlignment="start"
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={(e) => handleScroll(e, setVal, lastRef, data.length - 1)}
      >
        <View style={{ height: spacerHeight }} />
        {data.map((v) => (
          <View key={`v-${v}`} style={styles.wheelItem}>
            <Text
              style={[
                styles.wheelText,
                selectedVal === v && styles.wheelTextSelected,
              ]}
            >
              {v.toString().padStart(2, "0")}
            </Text>
          </View>
        ))}
        <View style={{ height: spacerHeight }} />
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {renderCalendar()}

      <View style={styles.timePickerContainer}>
        <Text style={styles.timeLabel}>Time available:</Text>
        <View style={styles.wheelsRow}>
          {/* Hour */}
          <View style={styles.wheelWrapper}>
            <Text style={styles.wheelLabel}>Hour</Text>
            <View style={styles.wheelContainer}>
              <View style={styles.selectionOverlay} pointerEvents="none" />
              {renderTimeWheel(
                Array.from({ length: 24 }, (_, i) => i),
                hourScrollRef,
                selectedHour,
                onHourChange,
                lastHourIndex
              )}
            </View>
          </View>

          {/* Colon */}
          <View style={styles.colonWrapper}>
            <Text style={styles.timeColon}>:</Text>
          </View>

          {/* Minute */}
          <View style={styles.wheelWrapper}>
            <Text style={styles.wheelLabel}>Min</Text>
            <View style={styles.wheelContainer}>
              <View style={styles.selectionOverlay} pointerEvents="none" />
              {renderTimeWheel(
                Array.from({ length: 60 }, (_, i) => i),
                minuteScrollRef,
                selectedMinute,
                onMinuteChange,
                lastMinuteIndex
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
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
  dayBubbleSelected: { backgroundColor: "#63B995" },
  calHeadText: { fontSize: 12, color: "#999", fontWeight: "bold" },
  calDayText: { fontSize: 14, color: "#333" },
  calDayTextSelected: { color: "#fff", fontWeight: "bold" },

  // Time Picker
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