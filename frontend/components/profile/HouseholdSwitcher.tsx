import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface HouseholdSwitcherProps {
  joinedHouseholds: string[];
  activeHouseholdId: string | undefined;
  householdNames: Record<string, string>;
  switching: boolean;
  onSwitch: (id: string) => void;
}

export default function HouseholdSwitcher({
  joinedHouseholds,
  activeHouseholdId,
  householdNames,
  switching,
  onSwitch,
}: HouseholdSwitcherProps) {
  if (joinedHouseholds.length <= 1) return null;

  return (
    <>
      <Text style={styles.sectionTitle}>Switch Household</Text>
      {joinedHouseholds.map((houseId) => {
        const isActive = houseId === activeHouseholdId;
        return(
          <TouchableOpacity
            key={houseId}
            style={[styles.switchButton, isActive && styles.activeSwitchButton]}
            onPress={() => onSwitch(houseId)}
            disabled={switching}
          >
            <Text style={[styles.switchText, isActive && styles.activeSwitchText]}>
              {householdNames[houseId] || "Loading..."}
            </Text>
            {isActive && <Ionicons name="checkmark-circle" size={20} color="#63B995" />}
          </TouchableOpacity>
        );
      })}
    </>
  )
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 15 },
  switchButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  activeSwitchButton: { borderColor: "#63B995", backgroundColor: "#F3E5F5" },
  switchText: { color: "#666", fontWeight: "500" },
  activeSwitchText: { color: "#63B995", fontWeight: "bold" },
});