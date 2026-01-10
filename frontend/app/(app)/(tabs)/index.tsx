import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

// Mock data for the UI build
const MOCK_CHORES = [
  { id: '1', title: 'Wash the Dishes', points: 50, completed: false },
  { id: '2', title: 'Vacuum Living Room', points: 100, completed: true },
  { id: '3', title: 'Take out Trash', points: 20, completed: false },
];

export default function HomeScreen() {
  const { user } = useAuth();

  return(
    <View style={styles.container}>
      {/* Header / Score Section */}
      <View style={styles.scoreCard}>
        <Text style={styles.greeting}>Hey, {user?.email?.split('@')[0]}!</Text>
        <Text style={styles.scoreTitle}>Current Score</Text>
        <Text style={styles.scoreValue}>170</Text>
      </View>

      <Text style={styles.sectionTitle}>Daily Chores</Text>

      <FlatList
        data={MOCK_CHORES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.choreItem}>
            {/* Left Side: Title */}
            <Text style={[styles.choreText, item.completed && styles.completedText]}>
              {item.title}
            </Text>

            {/* Right Side: Points and Icon grouped together */}
            <View style={styles.choreAction}>
              <Text style={styles.pointsText}>+{item.points} pts</Text>
              <Ionicons
                name={item.completed ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={item.completed ? "#4CAF50" : "#ccc"}
              />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  scoreCard: {
    backgroundColor: '#6200ee',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 10 },
  scoreTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  scoreValue: { color: '#fff', fontSize: 48, fontWeight: 'bold' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  choreItem: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  choreInfo: { flexDirection: 'column', alignItems: 'flex-start' },
  choreText: { fontSize: 16, flex: 1, color: '#333' },
  choreAction: { flexDirection: 'row', alignItems: 'center' },
  completedText: { textDecorationLine: 'line-through', color: '#aaa'},
  pointsText: { fontWeight: 'bold', color: '#6200ee', marginRight: 12 },
});