import React, { useState } from "react";
import { View, Text } from "react-native";
import PagerView from "react-native-pager-view";
import { useAuth } from "@/context/AuthContext";

interface ScoreCardProps {
  weeklyScore: number;
  monthlyScore: number;
  completedDays: number[];
}

export default function ScoreCard({
  weeklyScore,
  monthlyScore,
  completedDays,
}: ScoreCardProps) {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const currentDayIndex = (new Date().getDay() + 6) % 7;

  return (
    <View className="bg-light-100 rounded-3xl py-8 px-4 items-center mb-8 mt-5 overflow-hidden shadow-sm">
      {/* Greeting */}
      <Text className="text-white/80 text-base mb-1 font-medium">
        Hey, {user?.displayName || user?.email?.split("@")[0]}!
      </Text>

      {/* Pager View (Carousel) */}
      <PagerView
        style={{ width: "100%", height: 160 }}
        initialPage={0}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {/* Page 1: Weekly Score */}
        <View key="1" className="justify-center items-center w-full">
          <Text className="text-white/60 text-xs font-extrabold tracking-widest mt-2 mb-1">
            THIS WEEK
          </Text>
          <Text className="text-white text-6xl font-bold mb-2">
            {weeklyScore}
          </Text>

          {/* Streak Row */}
          <View className="flex-row justify-center mt-2 gap-2">
            {weekDays.map((day, index) => {
              const isCompleted = completedDays.includes(index);
              const isToday = index === currentDayIndex;

              return (
                <View key={index} className="items-center">
                  <View
                    className={`
                      w-8 h-8 rounded-full justify-center items-center
                      ${isCompleted ? "bg-gold" : "bg-white/20"}
                      ${isToday ? "border-2 border-white" : ""}  
                    `}
                  >
                    <Text
                      className={`
                        text-xs font-bold
                        ${isCompleted ? "text-light-100" : "text-white/60"}  
                      `}
                    >
                      {day}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Page 2: Monthly Score */}
        <View key="2" className="justify-center items-center w-full">
          <Text className="text-white/60 text-xs font-extrabold tracking-widest mt-2 mb-1">
            THIS MONTH
          </Text>
          <Text className="text-white text-6xl font-bold mb-2">
            {monthlyScore}
          </Text>

          <View className="h-8 justify-center mt-2">
            <Text className="text-white/80 text-sm italic">
              Keep stacking those points!
            </Text>
          </View>
        </View>
      </PagerView>

      {/* Pagination Dots */}
      <View className="flex-row mt-4 gap-2">
        <View
          className={`w-2 h-2 rounded-full ${currentPage === 0 ? "bg-white" : "bg-white/30"}`}
        />
        <View
          className={`w-2 h-2 rounded-full ${currentPage === 1 ? "bg-white" : "bg-white/30"}`}
        />
      </View>
    </View>
  );
}
