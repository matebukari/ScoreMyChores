import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useColorScheme,
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
  }, []);

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
      slots.push(
        <View 
          key={`empty-${i}`} 
          className="w-[14.28%] aspect-square justify-center items-center" 
        />
      );
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
          disabled={isPast}
          onPress={() => onDateChange(new Date(year, month, i))}
          className="w-[14.28%] aspect-square justify-center items-center"
        >
          <View
            className={`
              w-[34px] h-[34px] rounded-full justify-center items-center border border-transparent
              ${isSelected ? "bg-light-100" : ""}
              ${isPast ? "opacity-30" : "opacity-100"}
            `}
          >
            <Text
              className={`
                text-sm
                ${isSelected 
                  ? "text-white font-bold" 
                  : "text-text-main dark:text-text-inverted"
                }
              `}
            >
              {i}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View>
        {/* Calendar Header */}
        <View className="flex-row justify-between items-center mb-2.5">
          <TouchableOpacity
            onPress={() => setCurrentMonth(new Date(year, month - 1, 1))}
          >
            <Ionicons 
              name="chevron-back" 
              size={24} 
              color={isDark ? "#9CA3AF" : "#666"} 
            />
          </TouchableOpacity>
          
          <Text className="font-bold text-base text-text-main dark:text-text-inverted">
            {MONTHS[month]} {year}
          </Text>
          
          <TouchableOpacity
            onPress={() => setCurrentMonth(new Date(year, month + 1, 1))}
          >
            <Ionicons 
              name="chevron-forward" 
              size={24} 
              color={isDark ? "#9CA3AF" : "#666"} 
            />
          </TouchableOpacity>
        </View>

        {/* Days Grid */}
        <View className="flex-row flex-wrap">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <View 
              key={d} 
              className="w-[14.28%] aspect-square justify-center items-center"
            >
              <Text className="text-xs font-bold text-text-muted dark:text-gray-500">
                {d}
              </Text>
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
        className="w-[65px]"
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
          <View 
            key={`v-${v}`} 
            style={{ height: ITEM_HEIGHT, width: WHEEL_WIDTH }}
            className="justify-center items-center"
          >
            <Text
              className={`
                text-center
                ${selectedVal === v 
                  ? "text-lg font-bold text-light-100" 
                  : "text-base text-gray-500 dark:text-gray-400"
                }
              `}
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
    <View className="mt-2 border border-border-subtle dark:border-gray-600 rounded-xl p-2.5 bg-background-subtle dark:bg-dark-100">
      {renderCalendar()}

      <View className="border-t border-border-light dark:border-gray-600 pt-3">
        <Text className="text-sm font-semibold text-text-secondary dark:text-gray-400 mb-2.5 text-center">
          Time available:
        </Text>
        
        <View className="flex-row justify-center items-start">
          {/* Hour */}
          <View className="w-[65px] items-center">
            <Text className="text-[10px] text-text-muted dark:text-gray-500 mb-1 text-center w-full">
              Hour
            </Text>
            <View 
              style={{ height: WHEEL_HEIGHT, width: WHEEL_WIDTH }}
              className="overflow-hidden"
            >
              {/* Selection Overlay */}
              <View 
                className="absolute left-0 right-0 border-y border-gray-300 dark:border-gray-300 bg-light-100/10 z-10" // INCREASED VISIBILITY
                style={{ top: ITEM_HEIGHT, height: ITEM_HEIGHT }}
                pointerEvents="none" 
              />
              
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
          <View 
            style={{ height: WHEEL_HEIGHT }}
            className="justify-center items-center w-5 mt-5"
          >
            <Text className="text-2xl font-bold text-text-main dark:text-text-inverted">
              :
            </Text>
          </View>

          {/* Minute */}
          <View className="w-[65px] items-center">
            <Text className="text-[10px] text-text-muted dark:text-gray-500 mb-1 text-center w-full">
              Min
            </Text>
            <View 
              style={{ height: WHEEL_HEIGHT, width: WHEEL_WIDTH }}
              className="overflow-hidden"
            >
              {/* Selection Overlay */}
              <View 
                className="absolute left-0 right-0 border-y border-gray-300 dark:border-gray-300 bg-light-100/10 z-10" // INCREASED VISIBILITY
                style={{ top: ITEM_HEIGHT, height: ITEM_HEIGHT }}
                pointerEvents="none" 
              />
              
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
  );
}